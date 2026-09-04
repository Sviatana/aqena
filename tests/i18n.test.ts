import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  normalizeLocale,
} from "@/i18n/config";
import {
  en,
} from "@/i18n/dictionaries/en";
import {
  ru,
} from "@/i18n/dictionaries/ru";

function leafPaths(
  value: unknown,
  prefix = "",
): string[] {
  if (
    typeof value !== "object"
    || value === null
    || Array.isArray(value)
  ) {
    return [
      prefix,
    ];
  }

  return Object.entries(
    value,
  )
    .flatMap(
      ([
        key,
        child,
      ]) => {
        const next =
          prefix
            ? `${prefix}.${key}`
            : key;

        return leafPaths(
          child,
          next,
        );
      },
    )
    .sort();
}

function stringLeaves(
  value: unknown,
): string[] {
  if (
    typeof value
      === "string"
  ) {
    return [
      value,
    ];
  }

  if (
    typeof value !== "object"
    || value === null
    || Array.isArray(value)
  ) {
    return [];
  }

  return Object.values(
    value,
  ).flatMap(
    stringLeaves,
  );
}

describe(
  "Anvera i18n configuration",
  () => {
    it(
      "supports only ru and en with ru as default",
      () => {
        expect(
          LOCALES,
        ).toEqual([
          "ru",
          "en",
        ]);

        expect(
          DEFAULT_LOCALE,
        ).toBe(
          "ru",
        );
      },
    );

    it(
      "validates and normalizes locale values",
      () => {
        expect(
          isLocale(
            "ru",
          ),
        ).toBe(
          true,
        );

        expect(
          isLocale(
            "en",
          ),
        ).toBe(
          true,
        );

        expect(
          isLocale(
            "fr",
          ),
        ).toBe(
          false,
        );

        expect(
          normalizeLocale(
            "en",
          ),
        ).toBe(
          "en",
        );

        expect(
          normalizeLocale(
            "invalid",
          ),
        ).toBe(
          "ru",
        );

        expect(
          normalizeLocale(
            undefined,
          ),
        ).toBe(
          "ru",
        );
      },
    );

    it(
      "keeps Russian and English dictionaries structurally identical",
      () => {
        expect(
          leafPaths(
            ru,
          ),
        ).toEqual(
          leafPaths(
            en,
          ),
        );
      },
    );

    it(
      "contains no empty translation values",
      () => {
        for (
          const dictionary
          of [
            ru,
            en,
          ]
        ) {
          const values =
            stringLeaves(
              dictionary,
            );

          expect(
            values.length,
          ).toBeGreaterThan(
            0,
          );

          expect(
            values.every(
              (value) =>
                value.trim().length
                  > 0,
            ),
          ).toBe(
            true,
          );
        }
      },
    );
  },
);
