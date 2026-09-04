"use client";

import {
  useState,
} from "react";

import {
  useLocale,
} from "@/i18n/client";

import styles from "./dashboard.module.css";

type BrandColorInputProps = {
  defaultValue?: string;
  id: string;
  name: string;
};

const DEFAULT_COLOR =
  "#1d1e1a";

const HEX_PATTERN =
  /^#[0-9a-f]{6}$/i;

function validColor(
  value: string,
) {
  return HEX_PATTERN.test(
    value,
  );
}

export default function BrandColorInput({
  defaultValue =
    DEFAULT_COLOR,
  id,
  name,
}: BrandColorInputProps) {
  const {
    dictionary,
  } = useLocale();

  const copy =
    dictionary.dashboard.newAssistant;

  const initialColor =
    validColor(
      defaultValue,
    )
      ? defaultValue.toLowerCase()
      : DEFAULT_COLOR;

  const [
    color,
    setColor,
  ] =
    useState(
      initialColor,
    );

  const [
    hexText,
    setHexText,
  ] =
    useState(
      initialColor.toUpperCase(),
    );

  function handlePickerChange(
    value: string,
  ) {
    const normalized =
      value.toLowerCase();

    setColor(
      normalized,
    );

    setHexText(
      normalized.toUpperCase(),
    );
  }

  function handleHexChange(
    value: string,
  ) {
    const uppercase =
      value.toUpperCase();

    setHexText(
      uppercase,
    );

    if (
      validColor(
        uppercase,
      )
    ) {
      setColor(
        uppercase.toLowerCase(),
      );
    }
  }

  function handleHexBlur() {
    if (
      !validColor(
        hexText,
      )
    ) {
      setHexText(
        color.toUpperCase(),
      );
    }
  }

  return (
    <div
      className={
        styles.brandColorControl
      }
    >
      <input
        name={name}
        type="hidden"
        value={color}
      />

      <div
        className={
          styles.brandColorPickerWrap
        }
      >
        <input
          aria-label={copy.brandColorPickerLabel}
          className={
            styles.brandColorPicker
          }
          id={id}
          onChange={
            (event) =>
              handlePickerChange(
                event.target.value,
              )
          }
          type="color"
          value={color}
        />

        <div
          className={
            styles.brandColorText
          }
        >
          <strong>
            {copy.brandColor}
          </strong>

          <span>
            {copy.brandColorContext}
          </span>
        </div>

        <input
          aria-label={copy.brandColorHexLabel}
          className={
            styles.brandColorHex
          }
          maxLength={7}
          onBlur={
            handleHexBlur
          }
          onChange={
            (event) =>
              handleHexChange(
                event.target.value,
              )
          }
          spellCheck={false}
          type="text"
          value={hexText}
        />
      </div>

      <div
        className={
          styles.brandColorPreview
        }
      >
        <span
          aria-hidden="true"
          className={
            styles.brandColorSwatch
          }
          style={{
            backgroundColor:
              color,
          }}
        />

        <span>
          {copy.brandColorPreview}
        </span>
      </div>
    </div>
  );
}
