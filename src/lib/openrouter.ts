import "server-only";

import {
  resolveOpenRouterChatRouting,
  type OpenRouterAutoCostTier,
} from "@/lib/openrouter-routing";

type EmbeddingApiItem = {
  embedding?: number[];
  index?: number;
};

type EmbeddingApiResponse = {
  data?: EmbeddingApiItem[];
  model?: string;
  error?: {
    message?: string;
  };
};

type ChatApiResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
};

export type OpenRouterChatMessage = {
  role:
    | "system"
    | "user"
    | "assistant";
  content: string;
};

export type OpenRouterChatResult = {
  content: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
};

function requiredEnv(
  name: string,
) {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not configured`,
    );
  }

  return value;
}

function embeddingDimensions() {
  const raw =
    requiredEnv(
      "EMBEDDING_DIMENSIONS",
    );

  const value =
    Number.parseInt(
      raw,
      10,
    );

  if (
    !Number.isInteger(value)
    || value <= 0
  ) {
    throw new Error(
      "EMBEDDING_DIMENSIONS is invalid",
    );
  }

  return value;
}

function commonHeaders() {
  const apiKey =
    requiredEnv(
      "OPENROUTER_API_KEY",
    );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || "http://localhost:3000";

  return {
    Authorization:
      `Bearer ${apiKey}`,
    "Content-Type":
      "application/json",
    "HTTP-Referer":
      siteUrl,
    "X-OpenRouter-Title":
      "Anvera",
  };
}

async function wait(
  milliseconds: number,
) {
  await new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

function isTransientStatus(
  status: number,
) {
  return (
    status === 429
    || status === 502
    || status === 503
    || status === 529
  );
}

async function embeddingRequest(
  inputs: string[],
) {
  const model =
    requiredEnv(
      "EMBEDDING_MODEL",
    );

  const dimensions =
    embeddingDimensions();

  let lastError =
    "OpenRouter embedding request failed";

  for (
    let attempt = 1;
    attempt <= 2;
    attempt += 1
  ) {
    const response =
      await fetch(
        "https://openrouter.ai/api/v1/embeddings",
        {
          method: "POST",
          headers:
            commonHeaders(),
          body: JSON.stringify({
            model,
            input: inputs,
            dimensions,
            encoding_format:
              "float",
          }),
        },
      );

    const payload =
      (await response.json()) as EmbeddingApiResponse;

    if (response.ok) {
      return payload;
    }

    lastError =
      payload.error?.message
      || `OpenRouter HTTP ${response.status}`;

    if (
      !isTransientStatus(
        response.status,
      )
      || attempt === 2
    ) {
      break;
    }

    await wait(700);
  }

  throw new Error(
    lastError,
  );
}

function validateEmbeddingResponse(
  response: EmbeddingApiResponse,
  expectedCount: number,
) {
  const dimensions =
    embeddingDimensions();

  const data =
    response.data ?? [];

  if (
    data.length
    !== expectedCount
  ) {
    throw new Error(
      "Embedding response count does not match input count",
    );
  }

  const ordered =
    [...data].sort(
      (left, right) =>
        (left.index ?? 0)
        - (right.index ?? 0),
    );

  return ordered.map(
    (item, index) => {
      const vector =
        item.embedding;

      if (
        !Array.isArray(vector)
        || vector.length
          !== dimensions
      ) {
        throw new Error(
          `Embedding ${index} has an unexpected dimension`,
        );
      }

      return vector;
    },
  );
}

export async function embedDocuments(
  inputs: string[],
) {
  if (!inputs.length) {
    return [];
  }

  const response =
    await embeddingRequest(
      inputs,
    );

  return validateEmbeddingResponse(
    response,
    inputs.length,
  );
}

const QUERY_INSTRUCTION =
  "Given a customer support question, retrieve "
  + "passages from the company knowledge base "
  + "that are useful for answering the question accurately.";

export async function embedQuery(
  question: string,
) {
  const value =
    question.trim();

  if (!value) {
    throw new Error(
      "Query is empty",
    );
  }

  const input =
    `Instruct: ${QUERY_INSTRUCTION}\n`
    + `Query: ${value}`;

  const response =
    await embeddingRequest(
      [input],
    );

  const [vector] =
    validateEmbeddingResponse(
      response,
      1,
    );

  return vector;
}

export function toVectorLiteral(
  vector: number[],
) {
  return `[${vector.join(",")}]`;
}

class OpenRouterChatRequestError
  extends Error {
  transient: boolean;

  constructor(
    message: string,
    transient: boolean,
  ) {
    super(message);

    this.name =
      "OpenRouterChatRequestError";

    this.transient =
      transient;
  }
}

function chatRequestBody(
  model: string,
  messages:
    OpenRouterChatMessage[],
  autoCostTier:
    OpenRouterAutoCostTier,
) {
  const body:
    Record<
      string,
      unknown
    > = {
      model,
      messages,
      temperature: 0,
      max_tokens: 600,
    };

  if (
    model
    === "openrouter/auto"
  ) {
    body.plugins = [
      {
        id:
          "auto-router",
        cost_tier:
          autoCostTier,
      },
    ];
  }

  return body;
}

async function requestChatModel(
  model: string,
  messages:
    OpenRouterChatMessage[],
  autoCostTier:
    OpenRouterAutoCostTier,
): Promise<
  OpenRouterChatResult
> {
  let lastError =
    "OpenRouter chat request failed";

  let lastTransient =
    false;

  for (
    let attempt = 1;
    attempt <= 2;
    attempt += 1
  ) {
    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers:
            commonHeaders(),
          body:
            JSON.stringify(
              chatRequestBody(
                model,
                messages,
                autoCostTier,
              ),
            ),
        },
      );

    const payload =
      (
        await response.json()
      ) as ChatApiResponse;

    if (response.ok) {
      const content =
        payload.choices?.[0]
          ?.message?.content
          ?.trim();

      if (!content) {
        throw new Error(
          "OpenRouter returned an empty answer",
        );
      }

      const result:
        OpenRouterChatResult = {
          content,
          model:
            payload.model
            ?? null,
          inputTokens:
            payload.usage
              ?.prompt_tokens
            ?? null,
          outputTokens:
            payload.usage
              ?.completion_tokens
            ?? null,
        };

      console.info(
        "OPENROUTER_CHAT_COMPLETE",
        {
          requestedModel:
            model,
          selectedModel:
            result.model,
          inputTokens:
            result.inputTokens,
          outputTokens:
            result.outputTokens,
        },
      );

      return result;
    }

    lastError =
      payload.error?.message
      || (
        `OpenRouter HTTP ${response.status}`
      );

    lastTransient =
      isTransientStatus(
        response.status,
      );

    if (
      !lastTransient
      || attempt === 2
    ) {
      break;
    }

    await wait(700);
  }

  throw new OpenRouterChatRequestError(
    lastError,
    lastTransient,
  );
}

export async function completeChat(
  messages:
    OpenRouterChatMessage[],
): Promise<
  OpenRouterChatResult
> {
  const routing =
    resolveOpenRouterChatRouting();

  try {
    return await requestChatModel(
      routing.primaryModel,
      messages,
      routing.autoCostTier,
    );
  } catch (error) {
    const canUseFallback =
      routing.paidFallbackEnabled
      && routing.fallbackModel
        !== routing.primaryModel
      && error
        instanceof
          OpenRouterChatRequestError
      && error.transient;

    if (!canUseFallback) {
      throw error;
    }

    console.warn(
      "OPENROUTER_PAID_FALLBACK_TRIGGERED",
      {
        primaryModel:
          routing.primaryModel,
        fallbackModel:
          routing.fallbackModel,
        costTier:
          routing.autoCostTier,
        reason:
          error.message,
      },
    );

    return requestChatModel(
      routing.fallbackModel,
      messages,
      routing.autoCostTier,
    );
  }
}
