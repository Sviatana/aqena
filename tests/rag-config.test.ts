import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "server-only",
  () => ({}),
);

import {
  ragConfig,
} from "@/lib/rag/config";


const ENV_KEYS = [
  "RAG_TOP_K",
  "RAG_MIN_SIMILARITY",
  "CHAT_HISTORY_MESSAGES",
] as const;

const originalValues =
  Object.fromEntries(
    ENV_KEYS.map(
      (key) => [
        key,
        process.env[key],
      ],
    ),
  );


beforeEach(
  () => {
    for (
      const key
      of ENV_KEYS
    ) {
      delete process.env[
        key
      ];
    }
  },
);


afterEach(
  () => {
    for (
      const key
      of ENV_KEYS
    ) {
      const value =
        originalValues[
          key
        ];

      if (
        value === undefined
      ) {
        delete process.env[
          key
        ];
      } else {
        process.env[
          key
        ] = value;
      }
    }
  },
);


describe(
  "RAG configuration",
  () => {
    it(
      "uses required defaults and accepts valid overrides",
      () => {
        expect(
          ragConfig(),
        ).toEqual({
          topK: 5,
          minSimilarity: 0.4,
          historyMessages: 8,
        });

        process.env.RAG_TOP_K =
          "6";

        process.env.RAG_MIN_SIMILARITY =
          "0.55";

        process.env.CHAT_HISTORY_MESSAGES =
          "7";

        expect(
          ragConfig(),
        ).toEqual({
          topK: 6,
          minSimilarity: 0.55,
          historyMessages: 7,
        });
      },
    );

    it(
      "rejects invalid RAG environment values",
      () => {
        process.env.RAG_TOP_K =
          "0";

        expect(
          () => ragConfig(),
        ).toThrow(
          "RAG_TOP_K is invalid",
        );

        delete process.env.RAG_TOP_K;

        process.env.RAG_MIN_SIMILARITY =
          "1.1";

        expect(
          () => ragConfig(),
        ).toThrow(
          "RAG_MIN_SIMILARITY is invalid",
        );

        delete process.env
          .RAG_MIN_SIMILARITY;

        process.env.CHAT_HISTORY_MESSAGES =
          "-2";

        expect(
          () => ragConfig(),
        ).toThrow(
          "CHAT_HISTORY_MESSAGES is invalid",
        );
      },
    );
  },
);
