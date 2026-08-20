"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

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
  const question =
    questionValue(
      formData,
    );

  if (!question) {
    playgroundError(
      assistantId,
      "Ask a question first.",
    );
  }

  if (
    question.length
    > 2_000
  ) {
    playgroundError(
      assistantId,
      "Playground questions can be up to 2,000 characters.",
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
      "We could not check this assistant's knowledge.",
    );
  }

  if (
    (readySourceCount ?? 0)
    === 0
  ) {
    playgroundError(
      assistantId,
      "Process at least one knowledge source before using the Playground.",
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
      "We could not check your monthly message allowance.",
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
        ? "You have reached your Pro plan message limit for this month."
        : "You have reached the Free plan limit of 50 messages this month.",
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
      "We could not open the Playground conversation.",
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
      "We could not load the conversation history.",
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
          || "I could not find that in the available company knowledge.",
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
      "Anvera could not answer that question. Please try again.",
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
      "The answer was generated but could not be saved. Please try again.",
    );
  }

  const commit =
    commitRows?.[0];

  if (!commit) {
    playgroundError(
      assistantId,
      "We could not save this Playground exchange.",
    );
  }

  if (!commit.allowed) {
    playgroundError(
      assistantId,
      commit.plan_name === "pro"
        ? "You have reached your Pro plan message limit for this month."
        : "You have reached the Free plan limit of 50 messages this month.",
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
      "Answer generated.",
    ),
  );
}


export async function clearPlaygroundChat(
  assistantId: string,
) {
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
      "We could not clear this Playground conversation.",
    );
  }

  if (!conversation) {
    redirect(
      playgroundUrl(
        assistantId,
        "success",
        "Playground is already clear.",
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
      "We could not clear this Playground conversation.",
    );
  }

  revalidatePath(
    `/dashboard/assistants/${assistantId}/playground`,
  );

  redirect(
    playgroundUrl(
      assistantId,
      "success",
      "Playground conversation cleared.",
    ),
  );
}
