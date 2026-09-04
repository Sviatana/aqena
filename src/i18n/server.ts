import {
  cookies,
} from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type Dictionary,
  type Locale,
} from "@/i18n/config";
import {
  en,
} from "@/i18n/dictionaries/en";
import {
  ru,
} from "@/i18n/dictionaries/ru";

export function getDictionary(
  locale: Locale,
): Dictionary {
  return locale === "en"
    ? en
    : ru;
}

export async function getServerLocale():
Promise<Locale> {
  const cookieStore =
    await cookies();

  return normalizeLocale(
    cookieStore.get(
      LOCALE_COOKIE_NAME,
    )?.value,
  );
}

export async function getServerDictionary():
Promise<Dictionary> {
  const locale =
    await getServerLocale();

  return getDictionary(
    locale,
  );
}
