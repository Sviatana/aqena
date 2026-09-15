import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const actions =
  readFileSync(
    "src/app/auth/actions.ts",
    "utf8",
  );

const owner =
  readFileSync(
    "src/lib/platform-owner.ts",
    "utf8",
  );

describe(
  "platform owner login routing",
  () => {
    it(
      "routes the authenticated owner to platform admin",
      () => {
        expect(
          owner,
        ).toContain(
          'export const PLATFORM_OWNER_EMAIL',
        );

        expect(
          owner,
        ).toContain(
          '"ssidaren@gmail.com"',
        );

        expect(
          actions,
        ).toContain(
          "PLATFORM_OWNER_EMAIL",
        );

        expect(
          actions,
        ).toContain(
          'redirect("/platform-admin")',
        );

        expect(
          actions,
        ).toContain(
          'redirect("/dashboard")',
        );
      },
    );
  },
);
