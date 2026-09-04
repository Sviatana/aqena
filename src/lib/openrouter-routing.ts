export const DEFAULT_CHAT_MODEL =
  "openrouter/free";

export const DEFAULT_FALLBACK_MODEL =
  "openrouter/auto";

export const DEFAULT_AUTO_COST_TIER =
  "low";

export const AUTO_COST_TIERS = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export type OpenRouterAutoCostTier =
  (typeof AUTO_COST_TIERS)[number];

export type OpenRouterChatRoutingConfig = {
  primaryModel: string;
  paidFallbackEnabled: boolean;
  fallbackModel: string;
  autoCostTier: OpenRouterAutoCostTier;
};

function isAutoCostTier(
  value: string,
): value is OpenRouterAutoCostTier {
  return (
    AUTO_COST_TIERS as readonly string[]
  ).includes(value);
}

function envText(
  env: Record<
    string,
    string | undefined
  >,
  key: string,
) {
  return env[key]?.trim() ?? "";
}

export function resolveOpenRouterChatRouting(
  env: Record<
    string,
    string | undefined
  > = process.env,
): OpenRouterChatRoutingConfig {
  const primaryModel =
    envText(
      env,
      "LLM_MODEL",
    )
    || DEFAULT_CHAT_MODEL;

  const paidFallbackEnabled =
    envText(
      env,
      "LLM_PAID_FALLBACK_ENABLED",
    ).toLowerCase()
    === "true";

  const fallbackModel =
    envText(
      env,
      "LLM_FALLBACK_MODEL",
    )
    || DEFAULT_FALLBACK_MODEL;

  const requestedCostTier =
    envText(
      env,
      "OPENROUTER_AUTO_COST_TIER",
    ).toLowerCase();

  const autoCostTier =
    isAutoCostTier(
      requestedCostTier,
    )
      ? requestedCostTier
      : DEFAULT_AUTO_COST_TIER;

  return {
    primaryModel,
    paidFallbackEnabled,
    fallbackModel,
    autoCostTier,
  };
}
