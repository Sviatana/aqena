import "server-only";

function integerEnv(
  name: string,
  fallback: number,
) {
  const raw =
    process.env[name];

  if (!raw) {
    return fallback;
  }

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
      `${name} is invalid`,
    );
  }

  return value;
}

function numberEnv(
  name: string,
  fallback: number,
) {
  const raw =
    process.env[name];

  if (!raw) {
    return fallback;
  }

  const value =
    Number(raw);

  if (
    !Number.isFinite(value)
    || value < 0
    || value > 1
  ) {
    throw new Error(
      `${name} is invalid`,
    );
  }

  return value;
}

export function ragConfig() {
  return {
    topK:
      integerEnv(
        "RAG_TOP_K",
        5,
      ),
    minSimilarity:
      numberEnv(
        "RAG_MIN_SIMILARITY",
        0.4,
      ),
    historyMessages:
      integerEnv(
        "CHAT_HISTORY_MESSAGES",
        8,
      ),
  };
}
