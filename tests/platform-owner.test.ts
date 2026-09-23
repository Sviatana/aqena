import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const ownerSource =
  readFileSync(
    "src/lib/platform-owner.ts",
    "utf8",
  );

const pageSource =
  readFileSync(
    "src/app/platform-admin/page.tsx",
    "utf8",
  );

describe(
  "platform owner access",
  () => {
    it(
      "keeps owner authorization server-side",
      () => {
        expect(
          ownerSource,
        ).toContain(
          'import "server-only"',
        );

        expect(
          ownerSource,
        ).toContain(
          "process.env.PLATFORM_OWNER_EMAIL",
        );

        expect(
          ownerSource,
        ).not.toMatch(
          /[A-Z0-9._%+-]+@gmail\.com/i,
        );

        expect(
          ownerSource,
        ).toContain(
          "auth.getUser()",
        );

        expect(
          ownerSource,
        ).toContain(
          "email_confirmed_at",
        );

        expect(
          ownerSource,
        ).toContain(
          "notFound()",
        );

        expect(
          ownerSource,
        ).toContain(
          "SUPABASE_SECRET_KEY",
        );
      },
    );

    it(
      "loads users subscriptions and manual billing requests",
      () => {
        expect(
          pageSource,
        ).toContain(
          "auth.admin.listUsers",
        );

        expect(
          pageSource,
        ).toContain(
          '.from("subscriptions")',
        );

        expect(
          pageSource,
        ).toContain(
          '.from("billing_requests")',
        );

        expect(
          pageSource,
        ).not.toContain(
          ".update(",
        );

        expect(
          pageSource,
        ).not.toContain(
          ".insert(",
        );

        expect(
          pageSource,
        ).not.toContain(
          ".delete(",
        );
      },
    );
  },
);
