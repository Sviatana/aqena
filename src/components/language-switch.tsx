"use client";

import { usePathname } from "next/navigation";

import {
  useLocale,
} from "@/i18n/client";

export function LanguageSwitch() {
  const pathname = usePathname();

  const {
    locale,
    dictionary,
    setLocale,
  } = useLocale();

  if (
    pathname.startsWith("/platform-admin")
  ) {
    return null;
  }

  const copy =
    dictionary.common.language;

  return (
    <div
      aria-label={
        copy.label
      }
      className="aqena-language-switch"
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
