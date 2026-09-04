"use client";

import {
  useState,
} from "react";

import {
  useLocale,
} from "@/i18n/client";

import styles from "./dashboard.module.css";

type FileUploadFieldProps = {
  disabled: boolean;
};

export default function FileUploadField({
  disabled,
}: FileUploadFieldProps) {
  const {
    dictionary,
  } = useLocale();

  const copy =
    dictionary.dashboard.knowledge;

  const [
    fileName,
    setFileName,
  ] = useState(
    copy.noFileSelected,
  );

  return (
    <label
      className={`${styles.fileField}${
        disabled
          ? ` ${styles.fileFieldDisabled}`
          : ""
      }`}
      htmlFor="knowledge-file"
    >
      <span
        className={
          styles.fileControlRow
        }
      >
        <span
          className={
            styles.fileChooseButton
          }
        >
          {copy.chooseDocument}
        </span>

        <span
          aria-live="polite"
          className={
            styles.fileName
          }
        >
          {fileName}
        </span>
      </span>

      <input
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className={styles.fileInput}
        disabled={disabled}
        id="knowledge-file"
        name="file"
        onChange={(
          event,
        ) => {
          const file =
            event.currentTarget
              .files?.[0];

          setFileName(
            file?.name
              ?? copy.noFileSelected,
          );
        }}
        required
        type="file"
      />

      <small>
        {copy.privateDocument}
      </small>
    </label>
  );
}
