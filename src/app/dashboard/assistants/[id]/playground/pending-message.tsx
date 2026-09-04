"use client";

import {
  useFormStatus,
} from "react-dom";

import {
  useLocale,
} from "@/i18n/client";

import styles from "../../../dashboard.module.css";

export function PlaygroundPendingMessage() {
  const {
    data,
    pending,
  } =
    useFormStatus();

  const {
    dictionary,
  } =
    useLocale();

  const copy =
    dictionary.dashboard.playground;

  if (!pending) {
    return null;
  }

  const rawQuestion =
    data?.get(
      "question",
    );

  const question =
    typeof rawQuestion
      === "string"
      ? rawQuestion.trim()
      : "";

  if (!question) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={
        styles.playgroundPendingMessage
      }
    >
      <article
        className={
          styles.playgroundMessage
        }
        data-role="user"
      >
        <div
          className={
            styles.playgroundMessageLabel
          }
        >
          {copy.you}
        </div>

        <div
          className={
            styles.playgroundBubble
          }
        >
          <p>
            {question}
          </p>
        </div>
      </article>
    </div>
  );
}
