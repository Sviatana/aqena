import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizePublicWidgetLocale,
  publicWidgetCopy,
} from "@/i18n/public-widget";

describe(
  "public widget i18n",
  () => {
    it(
      "normalizes supported browser languages",
      () => {
        expect(
          normalizePublicWidgetLocale(
            "ru-RU",
          ),
        ).toBe("ru");

        expect(
          normalizePublicWidgetLocale(
            "en-US",
          ),
        ).toBe("en");
      },
    );

    it(
      "uses the requested fallback for unsupported languages",
      () => {
        expect(
          normalizePublicWidgetLocale(
            "fr-FR",
          ),
        ).toBe("ru");

        expect(
          normalizePublicWidgetLocale(
            "fr-FR",
            "en",
          ),
        ).toBe("en");
      },
    );

    it(
      "contains public UI and API copy in both locales",
      () => {
        for (
          const locale
          of [
            "ru",
            "en",
          ] as const
        ) {
          expect(
            publicWidgetCopy[
              locale
            ].launcher,
          ).not.toBe("");

          expect(
            publicWidgetCopy[
              locale
            ].assistantNotFound,
          ).not.toBe("");

          expect(
            publicWidgetCopy[
              locale
            ].questionTooLong,
          ).not.toBe("");
        }
      },
    );
  },
);
