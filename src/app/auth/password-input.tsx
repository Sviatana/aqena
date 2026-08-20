"use client";

import {
  useState,
  type ComponentPropsWithoutRef,
} from "react";

import styles from "./auth.module.css";

type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type"
>;

export function PasswordInput(
  props: PasswordInputProps,
) {
  const [visible, setVisible] =
    useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        {...props}
        type={visible ? "text" : "password"}
      />

      <button
        className={styles.passwordToggle}
        type="button"
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
        aria-pressed={visible}
        onClick={() => {
          setVisible((current) => !current);
        }}
      >
        {visible ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13.8C6.9 11.3 9.3 10 12 10s5.1 1.3 7 3.8"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 10.2C6.9 12.7 9.3 14 12 14s5.1-1.3 7-3.8"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
