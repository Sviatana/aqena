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

const installPage =
  source(
    "../src/app/dashboard/assistants/[id]/install/page.tsx",
  );

const assistantPage =
  source(
    "../src/app/dashboard/assistants/[id]/page.tsx",
  );

const dashboardPage =
  source(
    "../src/app/dashboard/page.tsx",
  );

const styles =
  source(
    "../src/app/dashboard/dashboard.module.css",
  );

describe(
  "self-service dashboard UI contract",
  () => {
    it(
      "offers unpublish for published assistants",
      () => {
        expect(
          installPage,
        ).toContain(
          "unpublishAssistant",
        );

        expect(
          installPage.replace(
            /\s+/g,
            "",
          ),
        ).toContain(
          "selfServiceCopy.unpublishAssistant",
        );

        expect(
          installPage.match(
            /action=\{\s*unpublishAssistant\s*\}/g,
          )?.length,
        ).toBeGreaterThanOrEqual(
          2,
        );
      },
    );

    it(
      "requires confirmation before deleting an assistant",
      () => {
        expect(
          assistantPage,
        ).toContain(
          "deleteAssistant.bind(",
        );

        expect(
          assistantPage,
        ).toContain(
          'name="confirmDelete"',
        );

        expect(
          assistantPage,
        ).toContain(
          "required",
        );

        expect(
          assistantPage,
        ).toContain(
          "deleteAssistantConfirm",
        );
      },
    );

    it(
      "requires confirmation before deleting the account",
      () => {
        expect(
          dashboardPage,
        ).toContain(
          "action={deleteAccount}",
        );

        expect(
          dashboardPage,
        ).toContain(
          'name="confirmDelete"',
        );

        expect(
          dashboardPage,
        ).toContain(
          "deleteAccountConfirm",
        );
      },
    );

    it(
      "shows assistant deletion success and account errors",
      () => {
        expect(
          dashboardPage,
        ).toContain(
          "params.deleted",
        );

        expect(
          dashboardPage,
        ).toContain(
          "params.accountError",
        );
      },
    );

    it(
      "has a responsive danger-zone presentation",
      () => {
        expect(
          styles,
        ).toContain(
          ".selfServiceDangerZone",
        );

        expect(
          styles,
        ).toContain(
          ".selfServiceConfirmation",
        );

        expect(
          styles,
        ).toContain(
          ".selfServiceDangerForm",
        );
      },
    );
  },
);
