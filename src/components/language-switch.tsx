"use client";

import {
  usePathname,
} from "next/navigation";

import {
  useLocale,
} from "@/i18n/client";

type LanguageSwitchProps = {
  variant?:
    | "global"
    | "header";
};

export function LanguageSwitch({
  variant = "global",
}: LanguageSwitchProps) {
  const pathname =
    usePathname();

  const {
    locale,
    dictionary,
    setLocale,
  } = useLocale();

  if (pathname.startsWith("/platform-admin")) {
    return null;
  }

  /*
   * На главном лендинге переключатель
   * находится непосредственно внутри header.
   *
   * Поэтому глобальный экземпляр из layout
   * здесь скрываем, чтобы не получить дубль.
   */
  if (
    variant === "global"
    && pathname === "/"
  ) {
    return null;
  }

  const copy =
    dictionary.common.language;

  /*
   * Header-вариант — одна action-кнопка.
   *
   * На RU показывает EN.
   * На EN показывает RU.
   */
  if (
    variant === "header"
  ) {
    const nextLocale =
      locale === "ru"
        ? "en"
        : "ru";

    const label =
      nextLocale === "ru"
        ? copy.switchToRussian
        : copy.switchToEnglish;

    const shortLabel =
      nextLocale === "ru"
        ? copy.ru
        : copy.en;

    return (
      <div
        className={
          "aqena-language-switch "
          + "aqena-language-switch--header"
        }
      >
        <button
          aria-label={label}
          onClick={() => {
            setLocale(
              nextLocale,
            );
          }}
          type="button"
        >
          {shortLabel}
        </button>
      </div>
    );
  }

  /*
   * Остальные экраны пока сохраняют
   * существующий двухкнопочный контракт.
   *
   * Так изменение лендинга не создаёт
   * регрессию auth/dashboard.
   */
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
