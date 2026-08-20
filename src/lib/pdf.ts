import "server-only";

import {
  extractText,
} from "unpdf";

export const MAX_PDF_PAGES =
  100;

const PDF_EXTRACTION_TIMEOUT_MS =
  20_000;

export class PdfExtractionError
  extends Error {
  public readonly code:
    | "too_many_pages"
    | "timeout"
    | "no_text"
    | "invalid_pdf";

  constructor(
    code:
      | "too_many_pages"
      | "timeout"
      | "no_text"
      | "invalid_pdf",
    message: string,
  ) {
    super(message);

    this.name =
      "PdfExtractionError";

    this.code =
      code;
  }
}

function normalizeExtractedPdfText(
  value: string,
) {
  return value
    .replace(
      /\u0000/g,
      "",
    )
    .replace(
      /\r\n?/g,
      "\n",
    )
    .replace(
      /[ \t]+\n/g,
      "\n",
    )
    .replace(
      /\n{3,}/g,
      "\n\n",
    )
    .trim();
}

export async function extractPdfText(
  file: Blob,
) {
  const buffer =
    await file.arrayBuffer();

  if (!buffer.byteLength) {
    throw new PdfExtractionError(
      "invalid_pdf",
      "The PDF is empty.",
    );
  }

  const bytes =
    new Uint8Array(
      buffer,
    );

  let timeoutId:
    ReturnType<
      typeof setTimeout
    >
    | undefined;

  try {
    const extractionPromise =
      extractText(
        bytes,
        {
          mergePages: true,
        },
      );

    const timeoutPromise =
      new Promise<never>(
        (
          _resolve,
          reject,
        ) => {
          timeoutId =
            setTimeout(
              () => {
                reject(
                  new PdfExtractionError(
                    "timeout",
                    "PDF processing took too long.",
                  ),
                );
              },
              PDF_EXTRACTION_TIMEOUT_MS,
            );
        },
      );

    const {
      text,
      totalPages,
    } =
      await Promise.race([
        extractionPromise,
        timeoutPromise,
      ]);

    if (
      totalPages
      > MAX_PDF_PAGES
    ) {
      throw new PdfExtractionError(
        "too_many_pages",
        `PDF documents can contain up to ${MAX_PDF_PAGES} pages.`,
      );
    }

    const normalized =
      normalizeExtractedPdfText(
        text,
      );

    if (!normalized) {
      throw new PdfExtractionError(
        "no_text",
        "The PDF does not contain readable text.",
      );
    }

    return {
      text:
        normalized,

      pageCount:
        totalPages,
    };
  } catch (error) {
    if (
      error
      instanceof PdfExtractionError
    ) {
      throw error;
    }

    throw new PdfExtractionError(
      "invalid_pdf",
      error instanceof Error
        ? error.message
        : "The PDF could not be read.",
    );
  } finally {
    if (
      timeoutId
      !== undefined
    ) {
      clearTimeout(
        timeoutId,
      );
    }
  }
}
