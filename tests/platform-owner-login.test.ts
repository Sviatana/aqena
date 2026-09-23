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
          "export function platformOwnerEmail",
        );

        expect(
          owner,
        ).toContain(
          "process.env.PLATFORM_OWNER_EMAIL",
        );

        expect(
          owner,
        ).not.toMatch(
          /[A-Z0-9._%+-]+@gmail\.com/i,
        );

        expect(
          actions,
        ).toContain(
          "platformOwnerEmail()",
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
