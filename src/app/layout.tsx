import type {
  Metadata,
} from "next";
import {
  Geist,
} from "next/font/google";

import "./globals.css";
import "./aqena-app-tokens.css";

import {
  LanguageSwitch,
} from "@/components/language-switch";
import {
  SectionReveal,
} from "@/components/section-reveal";
import {
  LocaleProvider,
} from "@/i18n/client";
import {
  getServerDictionary,
  getServerLocale,
} from "@/i18n/server";

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",
    subsets: [
      "latin",
    ],
    preload:
      false,
  });

export async function generateMetadata():
Promise<Metadata> {
  const dictionary =
    await getServerDictionary();

  return {
    title: {
      default:
        dictionary.metadata.title,
      template:
        "%s | AQENA",
    },
    description:
      dictionary
        .metadata
        .description,
    applicationName:
      "AQENA",
    creator:
      "AI24Solutions",
    publisher:
      "AI24Solutions",
    keywords:
      dictionary
        .metadata
        .keywords,
  };
}

export default async function RootLayout({
  children,
}: Readonly<LayoutProps<"/">>) {
  const locale =
    await getServerLocale();

  return (
    <html lang={locale}>
      <body
        className={
          geistSans.variable
        }
      >
        <LocaleProvider
          initialLocale={
            locale
          }
        >
          <LanguageSwitch />
          <SectionReveal />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
