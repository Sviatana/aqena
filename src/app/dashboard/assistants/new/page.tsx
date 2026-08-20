import Link from "next/link";

import { createAssistant } from "@/app/dashboard/actions";

import styles from "../../dashboard.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewAssistantPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <div className={styles.content}>
      <div>
        <div className={styles.eyebrow}>
          New assistant
        </div>

        <h1 className={styles.pageTitle}>
          Set up your assistant
        </h1>

        <p className={styles.pageLead}>
          Start with its role and boundaries.
          You will add company knowledge on the next step.
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
              Assistant name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Customer Support"
              maxLength={80}
              required
            />

            <span className={styles.fieldHint}>
              Customers may see this name later in the website chat.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Answers customer questions about delivery, returns and products"
              maxLength={500}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="instructions">
              Instructions
            </label>

            <textarea
              id="instructions"
              name="instructions"
              placeholder="Answer only from the company knowledge. Keep answers concise and say when the information is not available."
              maxLength={4000}
            />

            <span className={styles.fieldHint}>
              If you leave this empty, Anvera will use the safe default:
              answer only from uploaded company knowledge.
            </span>
          </div>

          <div className={styles.formActions}>
            <Link
              className={styles.secondaryButton}
              href="/dashboard"
            >
              Cancel
            </Link>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              Create assistant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
