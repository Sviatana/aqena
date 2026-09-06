import { AqenaLogo } from "@/components/aqena-brand";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { PasswordInput } from "@/app/auth/password-input";
import {
  getServerDictionary,
} from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: PageProps) {
  const copy =
    (
      await getServerDictionary()
    ).auth;

  const supabase =
    await createClient();

  const {
    data,
  } =
    await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const error =
    params.error
      === "This authentication link is invalid or has expired."
    || params.error
      === "This confirmation link is invalid or has expired."
      ? copy.errors.invalidAuthLink
      : params.error;

  const message =
    params.message
      === "Password updated. Sign in with your new password."
      ? copy.errors.passwordUpdated
      : params.message;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link
          aria-label={copy.homeLabel}
          className={styles.logo}
          href="/"
        >
          <AqenaLogo
            width={108}
          />
        </Link>

        <div className={styles.brandCopy}>
          <span className={styles.kicker}>
            {copy.login.kicker}
          </span>

          <h1>
            {copy.login.heroTitle}
          </h1>

          <p>
            {copy.login.heroBody}
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>
              {copy.login.title}
            </h2>

            <p>
              {copy.login.subtitle}
            </p>
          </header>

          <form
            action={signIn}
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

            {message ? (
              <div
                className={styles.notice}
                role="status"
              >
                {message}
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

            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="password">
                  {copy.common.password}
                </label>

                <Link
                  className={styles.forgotLink}
                  href="/auth/forgot-password"
                >
                  {copy.login.forgotPassword}
                </Link>
              </div>

              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              {copy.login.submit}
            </button>
          </form>

          <p className={styles.switch}>
            {copy.login.newToAQENA}{" "}
            <Link href="/auth/sign-up">
              {copy.login.createAccount}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
