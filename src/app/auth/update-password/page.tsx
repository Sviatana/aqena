import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  updatePassword,
} from "@/app/auth/actions";
import {
  PasswordInput,
} from "@/app/auth/password-input";
import {
  getServerDictionary,
} from "@/i18n/server";
import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
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
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  if (
    claimsError
    || !data?.claims?.sub
  ) {
    redirect(
      "/auth/forgot-password?error="
        + encodeURIComponent(
          copy.errors.requestNewResetLink,
        ),
    );
  }

  const params =
    await searchParams;

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
            {copy.updatePassword.kicker}
          </span>

          <h1>
            {copy.updatePassword.heroTitle}
          </h1>

          <p>
            {copy.updatePassword.heroBody}
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>
              {copy.updatePassword.title}
            </h2>

            <p>
              {copy.updatePassword.subtitle}
            </p>
          </header>

          <form
            action={updatePassword}
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
              <label htmlFor="password">
                {copy.common.newPassword}
              </label>

              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">
                {copy.common.confirmNewPassword}
              </label>

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              {copy.updatePassword.submit}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
