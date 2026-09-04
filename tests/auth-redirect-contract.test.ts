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
    new URL(
      "../src/app/auth/actions.ts",
      import.meta.url,
    ),
    "utf8",
  );

describe(
  "authentication email redirect contract",
  () => {
    it(
      "does not derive email destinations from request Origin",
      () => {
        expect(
          actions,
        ).not.toContain(
          'from "next/headers"',
        );

        expect(
          actions,
        ).not.toContain(
          'get("origin")',
        );

        expect(
          actions,
        ).not.toContain(
          "requestOrigin(",
        );
      },
    );

    it(
      "uses canonical callback for signup confirmation",
      () => {
        expect(
          actions,
        ).toContain(
          "`${siteUrl}/auth/callback?next=/dashboard`",
        );
      },
    );

    it(
      "uses canonical callback for password recovery",
      () => {
        expect(
          actions,
        ).toContain(
          "`${siteUrl}/auth/callback?next=/auth/update-password`",
        );
      },
    );
  },
);
