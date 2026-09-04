"use client";

import {
  useState,
} from "react";

import {
  useLocale,
} from "@/i18n/client";

type CopySnippetButtonProps = {
  snippet: string;
  className: string;
};

export default function CopySnippetButton({
  snippet,
  className,
}: CopySnippetButtonProps) {
  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const {
    dictionary,
  } =
    useLocale();

  const copy =
    dictionary.dashboard.install;

  async function copySnippet() {
    try {
      await navigator.clipboard
        .writeText(
          snippet,
        );

      setCopied(
        true,
      );

      window.setTimeout(
        () => {
          setCopied(
            false,
          );
        },
        1600,
      );
    } catch {
      setCopied(
        false,
      );
    }
  }

  return (
    <button
      className={
        className
      }
      onClick={
        copySnippet
      }
      type="button"
    >
      {copied
        ? copy.copied
        : copy.copyCode}
    </button>
  );
}
