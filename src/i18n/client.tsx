"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  isLocale,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "@/i18n/config";
import {
  en,
} from "@/i18n/dictionaries/en";
import {
  ru,
} from "@/i18n/dictionaries/ru";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (
    locale: Locale,
  ) => void;
};

const LocaleContext =
  createContext<
    LocaleContextValue | null
  >(null);

function persistLocale(
  locale: Locale,
) {
  window.localStorage.setItem(
    LOCALE_STORAGE_KEY,
    locale,
  );

  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "Path=/",
    `Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");

  document.documentElement.lang =
    locale;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router =
    useRouter();

  const dictionary =
    initialLocale === "en"
      ? en
      : ru;

  const setLocale =
    useCallback(
      (
        locale: Locale,
      ) => {
        persistLocale(
          locale,
        );

        router.refresh();
      },
      [
        router,
      ],
    );

  useEffect(
    () => {
      document.documentElement.lang =
        initialLocale;

      const stored =
        window.localStorage.getItem(
          LOCALE_STORAGE_KEY,
        );

      if (
        isLocale(stored)
        && stored
          !== initialLocale
      ) {
        persistLocale(
          stored,
        );

        router.refresh();
      }
    },
    [
      initialLocale,
      router,
    ],
  );

  const value =
    useMemo(
      () => ({
        locale:
          initialLocale,
        dictionary,
        setLocale,
      }),
      [
        dictionary,
        initialLocale,
        setLocale,
      ],
    );

  return (
    <LocaleContext.Provider
      value={value}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale():
LocaleContextValue {
  const context =
    useContext(
      LocaleContext,
    );

  if (!context) {
    throw new Error(
      "useLocale must be used within LocaleProvider",
    );
  }

  return context;
}
