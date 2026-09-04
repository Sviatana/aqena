import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

function source(
  relativePath: string,
) {
  return readFileSync(
    new URL(
      relativePath,
      import.meta.url,
    ),
    "utf8",
  );
}

function functionBlock(
  text: string,
  start: string,
  end?: string,
) {
  const startIndex =
    text.indexOf(start);

  if (startIndex < 0) {
    throw new Error(
      `Missing function marker: ${start}`,
    );
  }

  if (!end) {
    return text.slice(
      startIndex,
    );
  }

  const endIndex =
    text.indexOf(
      end,
      startIndex
        + start.length,
    );

  if (endIndex < 0) {
    throw new Error(
      `Missing end marker: ${end}`,
    );
  }

  return text.slice(
    startIndex,
    endIndex,
  );
}

const dashboardActions =
  source(
    "../src/app/dashboard/actions.ts",
  );

const publishActions =
  source(
    "../src/app/dashboard/publish-actions.ts",
  );

const assistantPage =
  source(
    "../src/app/dashboard/assistants/[id]/page.tsx",
  );

const publicWidgetRoute =
  source(
    "../src/app/api/public/assistants/[publicId]/messages/route.ts",
  );

describe(
  "self-service ownership and deletion contract",
  () => {
    it(
      "unpublishes only an assistant owned by the authenticated user",
      () => {
        const block =
          functionBlock(
            publishActions,
            "export async function unpublishAssistant",
          );

        expect(
          block,
        ).toMatch(
          /\.eq\(\s*"owner_id",\s*userId,\s*\)/,
        );

        expect(
          block,
        ).toContain(
          "is_published: false",
        );
      },
    );

    it(
      "authorizes assistant deletion before storage cleanup and keeps owner filter on delete",
      () => {
        const block =
          functionBlock(
            dashboardActions,
            "export async function deleteAssistant",
            "export async function deleteAccount",
          );

        const ownerChecks =
          block.match(
            /\.eq\(\s*"owner_id",\s*userId,\s*\)/g,
          )
          ?? [];

        expect(
          ownerChecks.length,
        ).toBeGreaterThanOrEqual(
          2,
        );

        expect(
          block.indexOf(
            "removeStoredKnowledge(",
          ),
        ).toBeGreaterThan(
          block.indexOf(
            '.from("assistants")',
          ),
        );

        expect(
          block,
        ).toContain(
          '.from("assistants")',
        );

        expect(
          block,
        ).toContain(
          ".delete()",
        );
      },
    );

    it(
      "scopes account cleanup to assistants owned by the authenticated user and cleans storage before auth deletion",
      () => {
        const block =
          functionBlock(
            dashboardActions,
            "export async function deleteAccount",
          );

        expect(
          block,
        ).toMatch(
          /\.eq\(\s*"owner_id",\s*userId,\s*\)/,
        );

        const cleanupIndex =
          block.indexOf(
            "removeStoredKnowledge(",
          );

        const authDeleteIndex =
          block.indexOf(
            ".deleteUser(",
          );

        expect(
          cleanupIndex,
        ).toBeGreaterThanOrEqual(
          0,
        );

        expect(
          authDeleteIndex,
        ).toBeGreaterThan(
          cleanupIndex,
        );
      },
    );

    it(
      "requires explicit confirmation for destructive assistant and account deletion",
      () => {
        expect(
          dashboardActions,
        ).toContain(
          'formData.get(\n      "confirmDelete",',
        );

        expect(
          dashboardActions,
        ).toContain(
          "if (!deleteConfirmed(formData))",
        );
      },
    );

    it(
      "keeps the public widget gated by publication state",
      () => {
        expect(
          publicWidgetRoute,
        ).toContain(
          "!assistant.is_published",
        );

        expect(
          publicWidgetRoute,
        ).toContain(
          'assistant.status\n      !== "ready"',
        );
      },
    );

    it(
      "counts knowledge sources only for the current assistant detail page",
      () => {
        expect(
          assistantPage,
        ).toMatch(
          /\.from\("knowledge_sources"\)[\s\S]*?count:\s*"exact"[\s\S]*?\.eq\(\s*"assistant_id",\s*id,\s*\)/,
        );
      },
    );
  },
);
