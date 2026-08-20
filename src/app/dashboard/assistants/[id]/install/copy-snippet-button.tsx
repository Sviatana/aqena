"use client";

import {
  useState,
} from "react";

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
        ? "Copied"
        : "Copy code"}
    </button>
  );
}
