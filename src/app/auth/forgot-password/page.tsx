import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";

import {
  requestPasswordReset,
} from "@/app/auth/actions";
import {
  getServerDictionary,
} from "@/i18n/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps) {
  const copy =
    (
      await getServerDictionary()
    ).auth;

  const params =
    await searchParams;

  const error =
    params.error
      === "Request a new password reset link to continue."
      ? copy.errors.requestNewResetLink
      : params.error;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link
          aria-label={copy.homeLabel}
          className={styles.logo}
          href="/"
        >
          <AnveraLogo
            width={108}
          />
        </Link>

        <div className={styles.brandCopy}>
          <span className={styles.kicker}>
            {copy.forgotPassword.kicker}
          </span>

          <h1>
            {copy.forgotPassword.heroTitle}
          </h1>

          <p>
            {copy.forgotPassword.heroBody}
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>
              {copy.forgotPassword.title}
            </h2>

            <p>
              {copy.forgotPassword.subtitle}
            </p>
          </header>

          <form
            action={requestPasswordReset}
            className={styles.form}
          >
            {error ? (
              <div
                className={styles.error}
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className={styles.field}>
              <label htmlFor="email">
                {copy.common.email}
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
              {copy.forgotPassword.submit}
            </button>
          </form>

          <p className={styles.switch}>
            {copy.forgotPassword.remembered}{" "}
            <Link href="/auth/login">
              {copy.forgotPassword.back}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
