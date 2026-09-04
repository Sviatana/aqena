import BrandColorInput from "@/app/dashboard/brand-color-input";
import Link from "next/link";

import {
  createAssistant,
} from "@/app/dashboard/actions";
import {
  getServerDictionary,
} from "@/i18n/server";

import styles from "../../dashboard.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewAssistantPage({
  searchParams,
}: PageProps) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.newAssistant;

  const params =
    await searchParams;

  return (
    <div className={styles.content}>
      <div>
        <div className={styles.eyebrow}>
          {copy.eyebrow}
        </div>

        <h1 className={styles.pageTitle}>
          {copy.title}
        </h1>

        <p className={styles.pageLead}>
          {copy.lead}
        </p>
      </div>

      <div className={styles.formCard}>
        {params.error ? (
          <div
            className={styles.error}
            role="alert"
          >
            {params.error}
          </div>
        ) : null}

        <form
          action={createAssistant}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="name">
              {copy.assistantName}
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder={
                copy.namePlaceholder
              }
              maxLength={80}
              required
            />

            <span className={styles.fieldHint}>
              {copy.nameHint}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              {copy.description}
            </label>

            <textarea
              id="description"
              name="description"
              placeholder={
                copy.descriptionPlaceholder
              }
              maxLength={500}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="welcome-message">
              {copy.welcomeMessage}
            </label>

            <textarea
              id="welcome-message"
              name="welcomeMessage"
              placeholder={
                copy.welcomePlaceholder
              }
              maxLength={500}
            />

            <span className={styles.fieldHint}>
              {copy.welcomeHint}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="instructions">
              {copy.instructions}
            </label>

            <textarea
              id="instructions"
              name="instructions"
              placeholder={
                copy.instructionsPlaceholder
              }
              maxLength={4000}
            />

            <span className={styles.fieldHint}>
              {copy.instructionsHint}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="brand-color">
              {copy.brandColor}
            </label>

            <BrandColorInput
              defaultValue="#1d1e1a"
              id="brand-color"
              name="brandColor"
            />

            <span className={styles.fieldHint}>
              {copy.brandHint}
            </span>
          </div>

          <div className={styles.formActions}>
            <Link
              className={styles.secondaryButton}
              href="/dashboard"
            >
              {copy.cancel}
            </Link>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              {copy.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
