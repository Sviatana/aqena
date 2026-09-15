"use client";

import {
  useFormStatus,
} from "react-dom";

type OwnerActionButtonProps = {
  children: string;
  className: string;
  confirmMessage: string;
  pendingLabel: string;
};

export function OwnerActionButton({
  children,
  className,
  confirmMessage,
  pendingLabel,
}: OwnerActionButtonProps) {
  const {
    pending,
  } =
    useFormStatus();

  return (
    <button
      className={
        className
      }
      disabled={
        pending
      }
      onClick={
        (event) => {
          if (
            !window.confirm(
              confirmMessage,
            )
          ) {
            event.preventDefault();
          }
        }
      }
      type="submit"
    >
      {
        pending
          ? pendingLabel
          : children
      }
    </button>
  );
}
