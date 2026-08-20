import {
  describe,
  expect,
  it,
} from "vitest";

import {
  FREE_KNOWLEDGE_SOURCE_LIMIT,
  MAX_KNOWLEDGE_FILE_BYTES,
  PRO_KNOWLEDGE_SOURCE_LIMIT,
  knowledgeSourceLimit,
  safeStorageFileName,
  validateKnowledgeFile,
} from "@/lib/knowledge";


function fakeFile(
  name: string,
  type: string,
  size: number,
) {
  return {
    name,
    type,
    size,
  } as File;
}


describe(
  "knowledge limits and file validation",
  () => {
    it(
      "uses the required Free and Pro source limits",
      () => {
        expect(
          FREE_KNOWLEDGE_SOURCE_LIMIT,
        ).toBe(3);

        expect(
          PRO_KNOWLEDGE_SOURCE_LIMIT,
        ).toBe(100);

        expect(
          knowledgeSourceLimit(
            "free",
          ),
        ).toBe(3);

        expect(
          knowledgeSourceLimit(
            "pro",
          ),
        ).toBe(100);

        expect(
          knowledgeSourceLimit(
            undefined,
          ),
        ).toBe(3);
      },
    );

    it(
      "accepts supported documents and rejects unsafe inputs",
      () => {
        expect(
          validateKnowledgeFile(
            fakeFile(
              "guide.pdf",
              "application/pdf",
              1024,
            ),
          ),
        ).toBeNull();

        expect(
          validateKnowledgeFile(
            fakeFile(
              "policy.txt",
              "text/plain",
              1024,
            ),
          ),
        ).toBeNull();

        expect(
          validateKnowledgeFile(
            fakeFile(
              "faq.md",
              "text/markdown",
              1024,
            ),
          ),
        ).toBeNull();

        expect(
          validateKnowledgeFile(
            fakeFile(
              "empty.txt",
              "text/plain",
              0,
            ),
          ),
        ).toBe(
          "Choose a non-empty document.",
        );

        expect(
          validateKnowledgeFile(
            fakeFile(
              "oversized.pdf",
              "application/pdf",
              MAX_KNOWLEDGE_FILE_BYTES
                + 1,
            ),
          ),
        ).toBe(
          "Documents can be up to 5 MB.",
        );

        expect(
          validateKnowledgeFile(
            fakeFile(
              "payload.exe",
              "application/octet-stream",
              1024,
            ),
          ),
        ).toBe(
          "Use a PDF, TXT or Markdown document.",
        );

        expect(
          validateKnowledgeFile(
            fakeFile(
              "fake.pdf",
              "text/plain",
              1024,
            ),
          ),
        ).toBe(
          "Use a PDF, TXT or Markdown document.",
        );
      },
    );

    it(
      "sanitizes storage file names without keeping path traversal",
      () => {
        expect(
          safeStorageFileName(
            "../../Quarterly policy 2026!!.PDF",
          ),
        ).toBe(
          "Quarterly-policy-2026.pdf",
        );
      },
    );
  },
);
