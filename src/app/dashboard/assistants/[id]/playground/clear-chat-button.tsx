"use client";

import {
  useFormStatus,
} from "react-dom";

import styles from "../../../dashboard.module.css";

export function PlaygroundClearButton() {
  const {
    pending,
  } =
    useFormStatus();

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
              "Clear this Playground conversation? "
              + "Your monthly usage will not be reset.",
            )
          ) {
            event.preventDefault();
          }
        }
      }
      type="submit"
    >
      {pending
        ? "Clearing…"
        : "Clear chat"}
    </button>
  );
}
