export const CHUNK_MIN_TOKENS = 700;
export const CHUNK_TARGET_TOKENS = 900;
export const CHUNK_MAX_TOKENS = 1000;
export const CHUNK_OVERLAP_TOKENS = 120;

const APPROX_CHARS_PER_TOKEN = 4;

export type KnowledgeChunk = {
  content: string;
  tokenCount: number;
};

export function estimateTokenCount(
  text: string,
) {
  const normalized =
    text.trim();

  if (!normalized) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil(
      normalized.length
      / APPROX_CHARS_PER_TOKEN,
    ),
  );
}

function normalizeText(
  value: string,
) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitOversizedParagraph(
  paragraph: string,
) {
  const words =
    paragraph
      .split(/\s+/)
      .filter(Boolean);

  const parts: string[] = [];

  let current: string[] = [];
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens =
      estimateTokenCount(
        current.length
          ? ` ${word}`
          : word,
      );

    if (
      current.length > 0
      && currentTokens + wordTokens
        > CHUNK_MAX_TOKENS
    ) {
      parts.push(
        current.join(" "),
      );

      current = [];
      currentTokens = 0;
    }

    current.push(word);
    currentTokens += wordTokens;
  }

  if (current.length) {
    parts.push(
      current.join(" "),
    );
  }

  return parts;
}

function tailForOverlap(
  text: string,
) {
  const words =
    text
      .split(/\s+/)
      .filter(Boolean);

  const selected: string[] = [];
  let tokens = 0;

  for (
    let index = words.length - 1;
    index >= 0;
    index -= 1
  ) {
    const word =
      words[index];

    const wordTokens =
      estimateTokenCount(
        selected.length
          ? `${word} `
          : word,
      );

    selected.unshift(word);
    tokens += wordTokens;

    if (
      tokens
      >= CHUNK_OVERLAP_TOKENS
    ) {
      break;
    }
  }

  return selected.join(" ");
}

const REBALANCE_MIN_OVERLAP_TOKENS = 100;
const REBALANCE_MAX_OVERLAP_TOKENS = 150;

type RebalancedFinalPair = {
  previous: KnowledgeChunk;
  last: KnowledgeChunk;
};

function rebalanceShortFinalPair(
  previousContent: string,
  novelContent: string,
): RebalancedFinalPair | null {
  const unique =
    `${previousContent.trim()}\n\n${novelContent.trim()}`
      .trim();

  const words =
    Array.from(
      unique.matchAll(
        /\S+/g,
      ),
    );

  if (words.length < 2) {
    return null;
  }

  let best:
    | {
        previous: KnowledgeChunk;
        last: KnowledgeChunk;
        score: number;
      }
    | null = null;

  for (
    let index = 1;
    index < words.length;
    index += 1
  ) {
    const boundary =
      words[index].index;

    if (
      boundary === undefined
    ) {
      continue;
    }

    const left =
      unique
        .slice(
          0,
          boundary,
        )
        .trim();

    const remainder =
      unique
        .slice(
          boundary,
        )
        .trim();

    if (
      !left
      || !remainder
    ) {
      continue;
    }

    const leftTokens =
      estimateTokenCount(
        left,
      );

    if (
      leftTokens
        < CHUNK_MIN_TOKENS
      || leftTokens
        > CHUNK_MAX_TOKENS
    ) {
      continue;
    }

    const overlap =
      tailForOverlap(
        left,
      );

    const overlapTokens =
      estimateTokenCount(
        overlap,
      );

    if (
      overlapTokens
        < REBALANCE_MIN_OVERLAP_TOKENS
      || overlapTokens
        > REBALANCE_MAX_OVERLAP_TOKENS
    ) {
      continue;
    }

    const right =
      `${overlap}\n\n${remainder}`
        .trim();

    const rightTokens =
      estimateTokenCount(
        right,
      );

    if (
      rightTokens
        < CHUNK_MIN_TOKENS
      || rightTokens
        > CHUNK_MAX_TOKENS
    ) {
      continue;
    }

    const lastCharacter =
      left.at(-1)
      ?? "";

    const semanticPenalty =
      /[.!?:;]/.test(
        lastCharacter,
      )
        ? 0
        : 1;

    const balancePenalty =
      Math.abs(
        leftTokens
        - rightTokens,
      );

    const targetPenalty =
      Math.abs(
        leftTokens
        - CHUNK_TARGET_TOKENS,
      )
      + Math.abs(
        rightTokens
        - CHUNK_TARGET_TOKENS,
      );

    const score =
      semanticPenalty
        * 100_000
      + balancePenalty
        * 100
      + targetPenalty;

    if (
      !best
      || score
        < best.score
    ) {
      best = {
        previous: {
          content:
            left,
          tokenCount:
            leftTokens,
        },

        last: {
          content:
            right,
          tokenCount:
            rightTokens,
        },

        score,
      };
    }
  }

  if (!best) {
    return null;
  }

  return {
    previous:
      best.previous,

    last:
      best.last,
  };
}

export function chunkKnowledgeText(
  rawText: string,
): KnowledgeChunk[] {
  const text =
    normalizeText(rawText);

  if (!text) {
    return [];
  }

  const initialParagraphs =
    text
      .split(/\n\s*\n/)
      .map(
        (paragraph) =>
          paragraph.trim(),
      )
      .filter(Boolean);

  const paragraphs =
    initialParagraphs.flatMap(
      (paragraph) =>
        estimateTokenCount(
          paragraph,
        )
          > CHUNK_MAX_TOKENS
          ? splitOversizedParagraph(
              paragraph,
            )
          : [paragraph],
    );

  const chunks: KnowledgeChunk[] = [];

  let current = "";
  let currentHasNewContent = false;
  let currentOverlap = "";

  function pushCurrent() {
    const content =
      current.trim();

    if (!content) {
      return;
    }

    chunks.push({
      content,
      tokenCount:
        estimateTokenCount(
          content,
        ),
    });
  }

  for (const paragraph of paragraphs) {
    const candidate =
      current
        ? `${current}\n\n${paragraph}`
        : paragraph;

    const candidateTokens =
      estimateTokenCount(
        candidate,
      );

    if (
      current
      && candidateTokens
        > CHUNK_MAX_TOKENS
    ) {
      const previous =
        current;

      pushCurrent();

      const overlap =
        tailForOverlap(
          previous,
        );

      current =
        overlap
          ? `${overlap}\n\n${paragraph}`
          : paragraph;

      currentOverlap = overlap;
      currentHasNewContent = true;

      continue;
    }

    current = candidate;
    currentHasNewContent = true;

    if (
      estimateTokenCount(current)
      >= CHUNK_TARGET_TOKENS
    ) {
      const previous =
        current;

      pushCurrent();

      current =
        tailForOverlap(
          previous,
        );

      currentOverlap = current;
      currentHasNewContent = false;
    }
  }

  if (
    current.trim()
    && currentHasNewContent
  ) {
    const last =
      current.trim();

    const lastTokens =
      estimateTokenCount(
        last,
      );

    const previous =
      chunks.at(-1);

    if (
      previous
      && currentOverlap
      && lastTokens < CHUNK_MIN_TOKENS
    ) {
      const overlap =
        currentOverlap.trim();

      if (
        last.startsWith(
          overlap,
        )
      ) {
        const novel =
          last
            .slice(
              overlap.length,
            )
            .trim();

        if (!novel) {
          return chunks;
        }

        const merged =
          `${previous.content}\n\n${novel}`
            .trim();

        const mergedTokens =
          estimateTokenCount(
            merged,
          );

        if (
          mergedTokens
          <= CHUNK_MAX_TOKENS
        ) {
          previous.content =
            merged;

          previous.tokenCount =
            mergedTokens;

          return chunks;
        }

        const rebalanced =
          rebalanceShortFinalPair(
            previous.content,
            novel,
          );

        if (rebalanced) {
          previous.content =
            rebalanced.previous
              .content;

          previous.tokenCount =
            rebalanced.previous
              .tokenCount;

          chunks.push(
            rebalanced.last,
          );

          return chunks;
        }
      }
    }

    if (
      previous
      && previous.content === last
    ) {
      return chunks;
    }

    chunks.push({
      content: last,
      tokenCount:
        lastTokens,
    });
  }

  return chunks;
}
