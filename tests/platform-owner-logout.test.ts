import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const pageSource =
  readFileSync(
    "src/app/platform-admin/page.tsx",
    "utf8",
  );

const authSource =
  readFileSync(
    "src/app/auth/actions.ts",
    "utf8",
  );

describe(
  "platform owner logout",
  () => {
    it(
      "uses the real server sign out action",
      () => {
        expect(
          pageSource,
        ).toContain(
          'from "@/app/auth/actions"',
        );

        expect(
          pageSource,
        ).toContain(
          "action={signOut}",
        );

        expect(
          pageSource,
        ).toContain(
          "Выйти",
        );

        expect(
          authSource,
        ).toContain(
          "export async function signOut()",
        );

        expect(
          authSource,
        ).toContain(
          "supabase.auth.signOut()",
        );
      },
    );
  },
);
