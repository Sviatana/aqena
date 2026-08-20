import {
  NextResponse,
} from "next/server";

import {
  answerFromKnowledge,
} from "@/lib/rag/answer";

import {
  ragConfig,
} from "@/lib/rag/config";

import {
  retrievePublicKnowledge,
} from "@/lib/rag/retrieve";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type WidgetRequestBody = {
  question?: unknown;
  conversationId?: unknown;
};

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      error:
        message,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const {
    publicId,
  } = await context.params;

  if (
    !UUID_PATTERN.test(
      publicId,
    )
  ) {
    return jsonError(
      "Assistant not found.",
      404,
    );
  }

  let body:
    WidgetRequestBody;

  try {
    body =
      await request.json() as WidgetRequestBody;
  } catch {
    return jsonError(
      "Invalid request.",
      400,
    );
  }

  const question =
    typeof body.question
      === "string"
      ? body.question.trim()
      : "";

  if (!question) {
    return jsonError(
      "Ask a question first.",
      400,
    );
  }

  if (
    question.length
    > 2_000
  ) {
    return jsonError(
      "Questions can be up to 2,000 characters.",
      400,
    );
  }

  const suppliedConversationId =
    typeof body.conversationId
      === "string"
      ? body.conversationId.trim()
      : "";

  if (
    suppliedConversationId
    && !UUID_PATTERN.test(
      suppliedConversationId,
    )
  ) {
    return jsonError(
      "Invalid conversation.",
      400,
    );
  }

  const admin =
    createAdminClient();

  const {
    data: assistant,
    error: assistantError,
  } = await admin
    .from("assistants")
    .select(
      "id,owner_id,name,instructions,fallback_message,status,is_published",
    )
    .eq(
      "public_id",
      publicId,
    )
    .maybeSingle();

  if (
    assistantError
    || !assistant
    || !assistant.is_published
    || assistant.status
      !== "ready"
  ) {
    return jsonError(
      "Assistant not found.",
      404,
    );
  }

  const {
    data: subscription,
    error: subscriptionError,
  } = await admin
    .from("subscriptions")
    .select(
      "plan,status",
    )
    .eq(
      "user_id",
      assistant.owner_id,
    )
    .maybeSingle();

  if (
    subscriptionError
    || subscription?.plan
      !== "pro"
    || subscription.status
      !== "active"
  ) {
    return jsonError(
      "Assistant not found.",
      404,
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

  const {
    data: usage,
    error: usageError,
  } = await admin
    .from("usage_monthly")
    .select(
      "message_count",
    )
    .eq(
      "user_id",
      assistant.owner_id,
    )
    .eq(
      "month",
      month,
    )
    .maybeSingle();

  if (usageError) {
    console.error(
      "WIDGET_USAGE_PRECHECK_FAILED",
      {
        publicId,
        message:
          usageError.message,
      },
    );

    return jsonError(
      "The assistant is temporarily unavailable.",
      503,
    );
  }

  if (
    (usage?.message_count ?? 0)
    >= 2_000
  ) {
    return jsonError(
      "This assistant has reached its monthly message limit.",
      429,
    );
  }

  let conversationId =
    suppliedConversationId;

  if (conversationId) {
    const {
      data: existingConversation,
      error: conversationLookupError,
    } = await admin
      .from("conversations")
      .select(
        "id",
      )
      .eq(
        "id",
        conversationId,
      )
      .eq(
        "assistant_id",
        assistant.id,
      )
      .eq(
        "channel",
        "widget",
      )
      .is(
        "user_id",
        null,
      )
      .maybeSingle();

    if (
      conversationLookupError
      || !existingConversation
    ) {
      return jsonError(
        "Conversation not found.",
        404,
      );
    }
  } else {
    const {
      data: createdConversation,
      error: conversationCreateError,
    } = await admin
      .from("conversations")
      .insert({
        assistant_id:
          assistant.id,

        user_id:
          null,

        channel:
          "widget",
      })
      .select(
        "id",
      )
      .single();

    if (
      conversationCreateError
      || !createdConversation
    ) {
      console.error(
        "WIDGET_CONVERSATION_CREATE_FAILED",
        {
          publicId,
          message:
            conversationCreateError
              ?.message
            ?? "Conversation missing",
        },
      );

      return jsonError(
        "The assistant is temporarily unavailable.",
        503,
      );
    }

    conversationId =
      createdConversation.id;
  }

  const config =
    ragConfig();

  const {
    data: historyRows,
    error: historyError,
  } = await admin
    .from("messages")
    .select(
      "role,content,created_at",
    )
    .eq(
      "conversation_id",
      conversationId,
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
    console.error(
      "WIDGET_HISTORY_FAILED",
      {
        publicId,
        conversationId,
        message:
          historyError.message,
      },
    );

    return jsonError(
      "The assistant is temporarily unavailable.",
      503,
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
      await retrievePublicKnowledge(
        admin,
        publicId,
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
      "WIDGET_RAG_FAILED",
      {
        publicId,

        message:
          error instanceof Error
            ? error.message
            : "Unknown RAG error",
      },
    );

    return jsonError(
      "The assistant could not answer that question. Please try again.",
      503,
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
  } = await admin.rpc(
    "commit_widget_exchange",
    {
      p_public_id:
        publicId,

      p_conversation_id:
        conversationId,

      p_user_content:
        question,

      p_assistant_content:
        result.answer,

      p_citations:
        citations,

      p_input_tokens:
        result.inputTokens
        ?? 0,

      p_output_tokens:
        result.outputTokens
        ?? 0,
    },
  );

  if (commitError) {
    console.error(
      "WIDGET_COMMIT_FAILED",
      {
        publicId,
        conversationId,
        message:
          commitError.message,
      },
    );

    return jsonError(
      "The answer was generated but could not be saved. Please try again.",
      503,
    );
  }

  const commit =
    commitRows?.[0];

  if (!commit) {
    return jsonError(
      "The answer could not be saved.",
      503,
    );
  }

  if (!commit.allowed) {
    return jsonError(
      "This assistant has reached its monthly message limit.",
      429,
    );
  }

  return NextResponse.json(
    {
      conversationId,
      answer:
        result.answer,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}
