"use client";

import {
  useFormStatus,
} from "react-dom";

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
        ? "Thinking…"
        : "Ask Anvera"}
    </button>
  );
}
