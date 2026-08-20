import Link from "next/link";
import { redirect } from "next/navigation";

import { updatePassword } from "@/app/auth/actions";
import { PasswordInput } from "@/app/auth/password-input";
import { createClient } from "@/lib/supabase/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();

  const {
    data,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (
    claimsError
    || !data?.claims?.sub
  ) {
    redirect(
      "/auth/forgot-password?error="
        + encodeURIComponent(
          "Request a new password reset link to continue.",
        ),
    );
  }

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
            Secure your account
          </span>

          <h1>
            Choose a new password for Anvera
          </h1>

          <p>
            Use a password you do not use for other services.
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Set new password</h2>

            <p>
              Your new password must contain at least 8 characters
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
                New password
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
                Confirm new password
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
              Update password
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
