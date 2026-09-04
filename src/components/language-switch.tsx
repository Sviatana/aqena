"use client";

import {
  useLocale,
} from "@/i18n/client";

export function LanguageSwitch() {
  const {
    locale,
    dictionary,
    setLocale,
  } = useLocale();

  const copy =
    dictionary.common.language;

  return (
    <div
      aria-label={
        copy.label
      }
      className="anvera-language-switch"
      role="group"
    >
      <button
        aria-label={
          copy.switchToRussian
        }
        aria-pressed={
          locale === "ru"
        }
        onClick={() => {
          setLocale(
            "ru",
          );
        }}
        type="button"
      >
        {copy.ru}
      </button>

      <button
        aria-label={
          copy.switchToEnglish
        }
        aria-pressed={
          locale === "en"
        }
        onClick={() => {
          setLocale(
            "en",
          );
        }}
        type="button"
      >
        {copy.en}
      </button>
    </div>
  );
}
