"use client";

import {
  useFormStatus,
} from "react-dom";

import {
  useLocale,
} from "@/i18n/client";

import styles from "../../../dashboard.module.css";

export function PlaygroundClearButton() {
  const {
    pending,
  } =
    useFormStatus();

  const {
    dictionary,
  } =
    useLocale();

  const copy =
    dictionary.dashboard.playground;

  return (
    <button
      className={
        styles.playgroundClearButton
      }
      disabled={
        pending
      }
      onClick={
        (event) => {
          if (
            !window.confirm(
              copy.clearConfirm,
            )
          ) {
            event.preventDefault();
          }
        }
      }
      type="submit"
    >
      {pending
        ? copy.clearing
        : copy.clearChat}
    </button>
  );
}
