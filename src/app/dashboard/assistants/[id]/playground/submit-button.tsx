"use client";

import {
  useFormStatus,
} from "react-dom";

import {
  useLocale,
} from "@/i18n/client";

import styles from "../../../dashboard.module.css";

type PlaygroundSubmitButtonProps = {
  disabled: boolean;
};

export function PlaygroundSubmitButton({
  disabled,
}: PlaygroundSubmitButtonProps) {
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
        styles.playgroundSubmit
      }
      disabled={
        disabled
        || pending
      }
      type="submit"
    >
      {pending
        ? copy.thinking
        : copy.askAssistant}
    </button>
  );
}
