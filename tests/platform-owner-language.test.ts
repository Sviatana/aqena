import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const languageSwitch =
  readFileSync(
    "src/components/language-switch.tsx",
    "utf8",
  );

const adminPage =
  readFileSync(
    "src/app/platform-admin/page.tsx",
    "utf8",
  );

describe(
  "platform owner language contract",
  () => {
    it(
      "does not render the global language switch on owner routes",
      () => {
        expect(
          languageSwitch,
        ).toContain(
          "usePathname",
        );

        expect(
          languageSwitch,
        ).toContain(
          'pathname.startsWith("/platform-admin")',
        );

        expect(
          languageSwitch,
        ).toContain(
          "return null",
        );
      },
    );

    it(
      "keeps the owner interface Russian",
      () => {
        expect(
          adminPage,
        ).toContain(
          "Управление платформой",
        );

        expect(
          adminPage,
        ).toContain(
          "Пользователи AQENA",
        );

        expect(
          adminPage,
        ).not.toContain(
          "getServerDictionary",
        );
      },
    );
  },
);
