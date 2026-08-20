import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CHUNK_MAX_TOKENS,
  CHUNK_MIN_TOKENS,
  chunkKnowledgeText,
  estimateTokenCount,
} from "@/lib/rag/chunk";


function paragraph(
  start: number,
  count = 320,
) {
  return Array.from(
    {
      length: count,
    },
    (_, index) =>
      `word${String(
        start + index,
      ).padStart(
        5,
        "0",
      )}`,
  ).join(" ");
}


function overlapTokenCount(
  left: string,
  right: string,
) {
  const leftWords =
    left
      .trim()
      .split(/\s+/);

  const rightWords =
    right
      .trim()
      .split(/\s+/);

  const maximum =
    Math.min(
      leftWords.length,
      rightWords.length,
    );

  for (
    let size = maximum;
    size > 0;
    size -= 1
  ) {
    const leftTail =
      leftWords
        .slice(-size)
        .join(" ");

    const rightHead =
      rightWords
        .slice(0, size)
        .join(" ");

    if (
      leftTail === rightHead
    ) {
      return estimateTokenCount(
        leftTail,
      );
    }
  }

  return 0;
}


describe(
  "knowledge chunking",
  () => {
    it(
      "returns no chunks for empty text",
      () => {
        expect(
          chunkKnowledgeText(
            " \n\n ",
          ),
        ).toEqual([]);
      },
    );

    it(
      "keeps long-document chunks within required bounds and overlap",
      () => {
        const text =
          Array.from(
            {
              length: 8,
            },
            (_, index) =>
              paragraph(
                index * 1000,
              ),
          ).join(
            "\n\n",
          );

        const chunks =
          chunkKnowledgeText(
            text,
          );

        expect(
          chunks.length,
        ).toBeGreaterThan(
          2,
        );

        for (
          const chunk
          of chunks
        ) {
          expect(
            chunk.tokenCount,
          ).toBeGreaterThanOrEqual(
            CHUNK_MIN_TOKENS,
          );

          expect(
            chunk.tokenCount,
          ).toBeLessThanOrEqual(
            CHUNK_MAX_TOKENS,
          );
        }

        for (
          let index = 1;
          index < chunks.length;
          index += 1
        ) {
          const overlap =
            overlapTokenCount(
              chunks[
                index - 1
              ].content,

              chunks[
                index
              ].content,
            );

          expect(
            overlap,
          ).toBeGreaterThanOrEqual(
            100,
          );

          expect(
            overlap,
          ).toBeLessThanOrEqual(
            150,
          );
        }
      },
    );
  },
);
