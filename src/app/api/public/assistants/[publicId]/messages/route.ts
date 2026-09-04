import {
  NextResponse,
} from "next/server";

import {
  normalizePublicWidgetLocale,
  publicWidgetCopy,
} from "@/i18n/public-widget";

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

const MAX_WIDGET_REQUEST_BYTES =
  32_768;

class WidgetRequestTooLargeError
  extends Error {}

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type WidgetRequestBody = {
  question?: unknown;
  conversationId?: unknown;
};

async function readWidgetRequestBody(
  request: Request,
): Promise<WidgetRequestBody> {
  const contentLengthHeader =
    request.headers
      .get(
        "content-length",
      );

  if (contentLengthHeader) {
    const contentLength =
      Number(
        contentLengthHeader,
      );

    if (
      Number.isFinite(
        contentLength,
      )
      && contentLength
        > MAX_WIDGET_REQUEST_BYTES
    ) {
      throw new WidgetRequestTooLargeError();
    }
  }

  const bodyStream =
    request.body;

  if (!bodyStream) {
    throw new SyntaxError(
      "Request body is empty",
    );
  }

  const reader =
    bodyStream.getReader();

  const chunks:
    Uint8Array[] = [];

  let totalBytes = 0;

  try {
    while (true) {
      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      totalBytes +=
        value.byteLength;

      if (
        totalBytes
        > MAX_WIDGET_REQUEST_BYTES
      ) {
        await reader.cancel();

        throw new WidgetRequestTooLargeError();
      }

      chunks.push(
        value,
      );
    }
  } finally {
    reader.releaseLock();
  }

  const bytes =
    new Uint8Array(
      totalBytes,
    );

  let offset = 0;

  for (
    const chunk
    of chunks
  ) {
    bytes.set(
      chunk,
      offset,
    );

    offset +=
      chunk.byteLength;
  }

  const text =
    new TextDecoder()
      .decode(
        bytes,
      );

  return JSON.parse(
    text,
  ) as WidgetRequestBody;
}

function clientAddress(
  request: Request,
) {
  const cloudflareIp =
    request.headers
      .get(
        "cf-connecting-ip",
      )
      ?.trim();

  return cloudflareIp
    || "unknown";
}

async function widgetRateLimitKey(
  publicId: string,
  request: Request,
) {
  const value =
    `${publicId}:${clientAddress(request)}`;

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder()
        .encode(
          value,
        ),
    );

  return Array.from(
    new Uint8Array(
      digest,
    ),
    (byte) =>
      byte
        .toString(16)
        .padStart(
          2,
          "0",
        ),
  ).join("");
}

function jsonError(
  message: string,
  status: number,
  extraHeaders:
    Record<
      string,
      string
    > = {},
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

        ...extraHeaders,
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

  const locale =
    normalizePublicWidgetLocale(
      new URL(
        request.url,
      )
        .searchParams
        .get(
          "locale",
        ),
      "en",
    );

  const copy =
    publicWidgetCopy[
      locale
    ];

  if (
    !UUID_PATTERN.test(
      publicId,
    )
  ) {
    return jsonError(
      copy.assistantNotFound,
      404,
    );
  }

  let body:
    WidgetRequestBody;

  try {
    body =
      await readWidgetRequestBody(
        request,
      );
  } catch (error) {
    if (
      error
      instanceof WidgetRequestTooLargeError
    ) {
      return jsonError(
        copy.requestTooLarge,
        413,
      );
    }

    return jsonError(
      copy.invalidRequest,
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
      copy.questionRequired,
      400,
    );
  }

  if (
    question.length
    > 2_000
  ) {
    return jsonError(
      copy.questionTooLong,
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
      copy.invalidConversation,
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
      copy.assistantNotFound,
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
      copy.assistantNotFound,
      404,
    );
  }

  const rateLimitKey =
    await widgetRateLimitKey(
      publicId,
      request,
    );

  const {
    data: rateLimitRows,
    error: rateLimitError,
  } = await admin.rpc(
    "consume_widget_rate_limit",
    {
      p_key_hash:
        rateLimitKey,
    },
  );

  if (rateLimitError) {
    console.error(
      "WIDGET_RATE_LIMIT_FAILED",
      {
        publicId,
        message:
          rateLimitError.message,
      },
    );

    return jsonError(
      copy.temporarilyUnavailable,
      503,
    );
  }

  const rateLimit =
    rateLimitRows?.[0];

  if (!rateLimit) {
    return jsonError(
      copy.temporarilyUnavailable,
      503,
    );
  }

  if (!rateLimit.allowed) {
    return jsonError(
      copy.rateLimited,
      429,
      {
        "Retry-After":
          String(
            Math.max(
              1,
              rateLimit
                .retry_after_seconds,
            ),
          ),
      },
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
      copy.temporarilyUnavailable,
      503,
    );
  }

  if (
    (usage?.message_count ?? 0)
    >= 2_000
  ) {
    return jsonError(
      copy.monthlyLimit,
      429,
    );
  }

  let conversationId =
    suppliedConversationId;

  const config =
    ragConfig();

  let history: Array<{
    role:
      | "user"
      | "assistant";
    content: string;
  }> = [];

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
        copy.conversationNotFound,
        404,
      );
    }

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
        copy.temporarilyUnavailable,
        503,
      );
    }

    history =
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
  }

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
          || copy.defaultFallback,
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
      copy.ragFailed,
      503,
    );
  }

  if (!conversationId) {
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
        copy.temporarilyUnavailable,
        503,
      );
    }

    conversationId =
      createdConversation.id;
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
      copy.answerSaveFailed,
      503,
    );
  }

  const commit =
    commitRows?.[0];

  if (!commit) {
    return jsonError(
      copy.answerCouldNotBeSaved,
      503,
    );
  }

  if (!commit.allowed) {
    return jsonError(
      copy.monthlyLimit,
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
