"use client";

import {
  useFormStatus,
} from "react-dom";

import {
  useLocale,
} from "@/i18n/client";

type PlaygroundQuestionFieldProps = {
  disabled: boolean;
  knowledgeReady: boolean;
};

export function PlaygroundQuestionField({
  disabled,
  knowledgeReady,
}: PlaygroundQuestionFieldProps) {
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
    <>
      <label
        htmlFor="playground-question"
      >
        {copy.questionLabel}
      </label>

      <textarea
        key={
          pending
            ? "pending"
            : "idle"
        }
        disabled={
          disabled
          || pending
        }
        id="playground-question"
        maxLength={
          2000
        }
        name="question"
        placeholder={
          knowledgeReady
            ? copy.questionPlaceholder
            : copy.knowledgeFirstPlaceholder
        }
      />
    </>
  );
}
