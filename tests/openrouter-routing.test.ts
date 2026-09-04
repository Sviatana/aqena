import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveOpenRouterChatRouting,
} from "@/lib/openrouter-routing";

describe(
  "OpenRouter chat routing",
  () => {
    it(
      "uses the free router by default",
      () => {
        expect(
          resolveOpenRouterChatRouting(
            {},
          ),
        ).toEqual({
          primaryModel:
            "openrouter/free",
          paidFallbackEnabled:
            false,
          fallbackModel:
            "openrouter/auto",
          autoCostTier:
            "low",
        });
      },
    );

    it(
      "keeps paid fallback disabled unless explicitly enabled",
      () => {
        expect(
          resolveOpenRouterChatRouting({
            LLM_PAID_FALLBACK_ENABLED:
              "false",
          }).paidFallbackEnabled,
        ).toBe(false);

        expect(
          resolveOpenRouterChatRouting({
            LLM_PAID_FALLBACK_ENABLED:
              "true",
          }).paidFallbackEnabled,
        ).toBe(true);
      },
    );

    it(
      "accepts only supported auto-router cost tiers",
      () => {
        expect(
          resolveOpenRouterChatRouting({
            OPENROUTER_AUTO_COST_TIER:
              "max",
          }).autoCostTier,
        ).toBe("max");

        expect(
          resolveOpenRouterChatRouting({
            OPENROUTER_AUTO_COST_TIER:
              "anything",
          }).autoCostTier,
        ).toBe("low");
      },
    );

    it(
      "allows explicit model overrides without changing the safe defaults",
      () => {
        const config =
          resolveOpenRouterChatRouting({
            LLM_MODEL:
              "openrouter/free",
            LLM_FALLBACK_MODEL:
              "openrouter/auto",
            LLM_PAID_FALLBACK_ENABLED:
              "true",
            OPENROUTER_AUTO_COST_TIER:
              "low",
          });

        expect(
          config.primaryModel,
        ).toBe(
          "openrouter/free",
        );

        expect(
          config.fallbackModel,
        ).toBe(
          "openrouter/auto",
        );

        expect(
          config.paidFallbackEnabled,
        ).toBe(true);

        expect(
          config.autoCostTier,
        ).toBe("low");
      },
    );
  },
);
