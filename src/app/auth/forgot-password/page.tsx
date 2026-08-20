import Link from "next/link";

import { requestPasswordReset } from "@/app/auth/actions";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link
          className={styles.logo}
          href="/"
        >
          Anvera
        </Link>

        <div className={styles.brandCopy}>
          <span className={styles.kicker}>
            Account recovery
          </span>

          <h1>
            Get back to your assistants and company knowledge
          </h1>

          <p>
            Enter the email you use for Anvera.
            We will send you a secure link to choose a new password.
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Reset your password</h2>

            <p>
              Enter your account email and we will send you a reset link
            </p>
          </header>

          <form
            action={requestPasswordReset}
            className={styles.form}
          >
            {params.error ? (
              <div
                className={styles.error}
                role="alert"
              >
                {params.error}
              </div>
            ) : null}

            <div className={styles.field}>
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              Send reset link
            </button>
          </form>

          <p className={styles.switch}>
            Remembered your password?{" "}
            <Link href="/auth/login">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
