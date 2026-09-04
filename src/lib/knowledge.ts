export const KNOWLEDGE_BUCKET =
  "knowledge-documents";

export const FREE_KNOWLEDGE_SOURCE_LIMIT = 3;
export const PRO_KNOWLEDGE_SOURCE_LIMIT = 100;

export const MAX_KNOWLEDGE_FILE_BYTES =
  5 * 1024 * 1024;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type KnowledgeFileValidationMessages = {
  empty: string;
  tooLarge: string;
  unsupported: string;
};

const DEFAULT_FILE_VALIDATION_MESSAGES:
KnowledgeFileValidationMessages = {
  empty:
    "Choose a non-empty document.",
  tooLarge:
    "Documents can be up to 5 MB.",
  unsupported:
    "Use a PDF, TXT or Markdown document.",
};

export function isUuid(
  value: string,
) {
  return UUID_PATTERN.test(value);
}

export function knowledgeSourceLimit(
  plan: string | null | undefined,
) {
  return plan === "pro"
    ? PRO_KNOWLEDGE_SOURCE_LIMIT
    : FREE_KNOWLEDGE_SOURCE_LIMIT;
}

function fileExtension(
  fileName: string,
) {
  const dot =
    fileName.lastIndexOf(".");

  return dot >= 0
    ? fileName
        .slice(dot)
        .toLowerCase()
    : "";
}

export function validateKnowledgeFile(
  file: File,
  messages:
    KnowledgeFileValidationMessages =
      DEFAULT_FILE_VALIDATION_MESSAGES,
) {
  if (file.size <= 0) {
    return messages.empty;
  }

  if (
    file.size
    > MAX_KNOWLEDGE_FILE_BYTES
  ) {
    return messages.tooLarge;
  }

  const extension =
    fileExtension(file.name);

  const validMime =
    extension === ".pdf"
      ? file.type === "application/pdf"
      : extension === ".txt"
        ? file.type === "text/plain"
        : extension === ".md"
          ? (
              file.type === "text/markdown"
              || file.type === "text/plain"
            )
          : false;

  if (!validMime) {
    return messages.unsupported;
  }

  return null;
}

export function safeStorageFileName(
  fileName: string,
) {
  const extension =
    fileExtension(fileName);

  const base =
    extension
      ? fileName.slice(
          0,
          -extension.length,
        )
      : fileName;

  const safeBase =
    base
      .normalize("NFKD")
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        "-",
      )
      .replace(
        /^[-_.]+|[-_.]+$/g,
        "",
      )
      .slice(0, 100)
      || "document";

  return `${safeBase}${extension}`;
}
