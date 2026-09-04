"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  getServerDictionary,
} from "@/i18n/server";

import {
  answerFromKnowledge,
} from "@/lib/rag/answer";

import {
  ragConfig,
} from "@/lib/rag/config";

import {
  retrieveKnowledge,
} from "@/lib/rag/retrieve";

import {
  createClient,
} from "@/lib/supabase/server";


function playgroundUrl(
  assistantId: string,
  key:
    | "error"
    | "success",
  message: string,
) {
  return (
    `/dashboard/assistants/${assistantId}/playground`
    + `?${key}=${encodeURIComponent(message)}`
  );
}


function playgroundError(
  assistantId: string,
  message: string,
): never {
  redirect(
    playgroundUrl(
      assistantId,
      "error",
      message,
    ),
  );
}


function questionValue(
  formData: FormData,
) {
  const value =
    formData.get(
      "question",
    );

  return typeof value
    === "string"
    ? value.trim()
    : "";
}


export async function sendPlaygroundMessage(
  assistantId: string,
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.playground;

  const question =
    questionValue(
      formData,
    );

  if (!question) {
    playgroundError(
      assistantId,
      copy.errors.questionRequired,
    );
  }

  if (
    question.length
    > 2_000
  ) {
    playgroundError(
      assistantId,
      copy.errors.questionTooLong,
    );
  }

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError
    || !userId
  ) {
    redirect(
      "/auth/login",
    );
  }

  const {
    data: assistant,
    error: assistantError,
  } = await supabase
    .from("assistants")
    .select(
      "id,name,instructions,fallback_message",
    )
    .eq(
      "id",
      assistantId,
    )
    .eq(
      "owner_id",
      userId,
    )
    .maybeSingle();

  if (
    assistantError
    || !assistant
  ) {
    redirect(
      "/dashboard",
    );
  }

  const {
    count: readySourceCount,
    error: sourceCountError,
  } = await supabase
    .from(
      "knowledge_sources",
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "assistant_id",
      assistantId,
    )
    .eq(
      "status",
      "ready",
    );

  if (sourceCountError) {
    playgroundError(
      assistantId,
      copy.errors.knowledgeCheckFailed,
    );
  }

  if (
    (readySourceCount ?? 0)
    === 0
  ) {
    playgroundError(
      assistantId,
      copy.errors.knowledgeRequired,
    );
  }

  const month =
    (
      new Date()
        .toISOString()
        .slice(
          0,
          7,
        )
      + "-01"
    );

  const [
    subscriptionResult,
    usageResult,
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(
        "plan,status",
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from("usage_monthly")
      .select(
        "message_count",
      )
      .eq(
        "user_id",
        userId,
      )
      .eq(
        "month",
        month,
      )
      .maybeSingle(),
  ]);

  if (
    subscriptionResult.error
    || usageResult.error
  ) {
    playgroundError(
      assistantId,
      copy.errors.allowanceCheckFailed,
    );
  }

  const isPro =
    subscriptionResult.data
      ?.plan === "pro"
    && subscriptionResult.data
      ?.status === "active";

  const messageLimit =
    isPro
      ? 2000
      : 50;

  const messagesUsed =
    usageResult.data
      ?.message_count
    ?? 0;

  if (
    messagesUsed
    >= messageLimit
  ) {
    playgroundError(
      assistantId,
      isPro
        ? copy.errors.proLimit
        : copy.errors.freeLimit,
    );
  }

  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from(
      "conversations",
    )
    .upsert(
      {
        assistant_id:
          assistantId,

        user_id:
          userId,

        channel:
          "playground",
      },
      {
        onConflict:
          "assistant_id,user_id,channel",
      },
    )
    .select(
      "id",
    )
    .single();

  if (
    conversationError
    || !conversation
  ) {
    console.error(
      "PLAYGROUND_CONVERSATION_FAILED",
      {
        assistantId,
        message:
          conversationError
            ?.message
          ?? "Conversation missing",
      },
    );

    playgroundError(
      assistantId,
      copy.errors.conversationOpenFailed,
    );
  }

  const config =
    ragConfig();

  const {
    data: historyRows,
    error: historyError,
  } = await supabase
    .from(
      "messages",
    )
    .select(
      "role,content,created_at",
    )
    .eq(
      "conversation_id",
      conversation.id,
    )
    .in(
      "role",
      [
        "user",
        "assistant",
      ],
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(
      config.historyMessages,
    );

  if (historyError) {
    playgroundError(
      assistantId,
      copy.errors.historyLoadFailed,
    );
  }

  const history =
    (historyRows ?? [])
      .slice()
      .reverse()
      .map(
        (message) => ({
          role:
            message.role
            === "assistant"
              ? "assistant" as const
              : "user" as const,

          content:
            message.content,
        }),
      );

  let result:
    Awaited<
      ReturnType<
        typeof answerFromKnowledge
      >
    >;

  try {
    const chunks =
      await retrieveKnowledge(
        supabase,
        assistantId,
        question,
      );

    result =
      await answerFromKnowledge({
        question,
        chunks,
        history,

        assistantInstructions:
          assistant.instructions,

        fallbackMessage:
          assistant.fallback_message
          || copy.errors.defaultFallback,
      });
  } catch (error) {
    console.error(
      "PLAYGROUND_RAG_FAILED",
      {
        assistantId,

        message:
          error instanceof Error
            ? error.message
            : "Unknown RAG error",
      },
    );

    playgroundError(
      assistantId,
      copy.errors.answerFailed,
    );
  }

  const citations =
    result.citations.map(
      (citation) => ({
        sourceId:
          citation.sourceId,

        sourceTitle:
          citation.sourceTitle,

        chunkId:
          citation.chunkId,

        similarity:
          citation.similarity,
      }),
    );

  const {
    data: commitRows,
    error: commitError,
  } = await supabase.rpc(
    "commit_playground_exchange",
    {
      p_assistant_id:
        assistantId,

      p_conversation_id:
        conversation.id,

      p_user_content:
        question,

      p_assistant_content:
        result.answer,

      p_citations:
        citations,

      p_input_tokens:
        result.inputTokens ?? 0,

      p_output_tokens:
        result.outputTokens ?? 0,
    },
  );

  if (commitError) {
    console.error(
      "PLAYGROUND_COMMIT_FAILED",
      {
        assistantId,
        message:
          commitError.message,
      },
    );

    playgroundError(
      assistantId,
      copy.errors.answerSaveFailed,
    );
  }

  const commit =
    commitRows?.[0];

  if (!commit) {
    playgroundError(
      assistantId,
      copy.errors.exchangeSaveFailed,
    );
  }

  if (!commit.allowed) {
    playgroundError(
      assistantId,
      commit.plan_name === "pro"
        ? copy.errors.proLimit
        : copy.errors.freeLimit,
    );
  }

  revalidatePath(
    `/dashboard/assistants/${assistantId}/playground`,
  );

  revalidatePath(
    "/dashboard",
  );

  redirect(
    playgroundUrl(
      assistantId,
      "success",
      copy.errors.answerGenerated,
    ),
  );
}


export async function clearPlaygroundChat(
  assistantId: string,
) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.playground;

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError
    || !userId
  ) {
    redirect(
      "/auth/login",
    );
  }

  const {
    data: assistant,
    error: assistantError,
  } = await supabase
    .from("assistants")
    .select("id")
    .eq(
      "id",
      assistantId,
    )
    .eq(
      "owner_id",
      userId,
    )
    .maybeSingle();

  if (
    assistantError
    || !assistant
  ) {
    redirect(
      "/dashboard",
    );
  }

  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq(
      "assistant_id",
      assistantId,
    )
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "channel",
      "playground",
    )
    .maybeSingle();

  if (conversationError) {
    console.error(
      "PLAYGROUND_CLEAR_LOOKUP_FAILED",
      {
        assistantId,
        message:
          conversationError.message,
      },
    );

    playgroundError(
      assistantId,
      copy.errors.clearFailed,
    );
  }

  if (!conversation) {
    redirect(
      playgroundUrl(
        assistantId,
        "success",
        copy.errors.alreadyClear,
      ),
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("conversations")
    .delete()
    .eq(
      "id",
      conversation.id,
    )
    .eq(
      "assistant_id",
      assistantId,
    )
    .eq(
      "user_id",
      userId,
    )
    .eq(
      "channel",
      "playground",
    );

  if (deleteError) {
    console.error(
      "PLAYGROUND_CLEAR_FAILED",
      {
        assistantId,
        message:
          deleteError.message,
      },
    );

    playgroundError(
      assistantId,
      copy.errors.clearFailed,
    );
  }

  revalidatePath(
    `/dashboard/assistants/${assistantId}/playground`,
  );

  redirect(
    playgroundUrl(
      assistantId,
      "success",
      copy.errors.cleared,
    ),
  );
}
