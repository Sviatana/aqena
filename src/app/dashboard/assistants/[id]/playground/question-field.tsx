"use client";

import {
  useFormStatus,
} from "react-dom";


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

  return (
    <>
      <label
        htmlFor="playground-question"
      >
        Ask a question
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
            ? "Ask about your company knowledge…"
            : "Process a knowledge source first"
        }
      />
    </>
  );
}
