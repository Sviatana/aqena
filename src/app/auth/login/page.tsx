import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { PasswordInput } from "@/app/auth/password-input";
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
  const supabase = await createClient();

  const {
    data,
  } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = params.error;
  const message = params.message;

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
            Your company knowledge
          </span>

          <h1>
            Reliable answers start with what your business knows
          </h1>

          <p>
            Add your documents, test real questions and give customers
            answers backed by your own knowledge.
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Welcome back</h2>
            <p>
              Sign in to manage your assistants and company knowledge
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

            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="password">
                  Password
                </label>

                <Link
                  className={styles.forgotLink}
                  href="/auth/forgot-password"
                >
                  Forgot password?
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
              Sign in
            </button>
          </form>

          <p className={styles.switch}>
            New to Anvera?{" "}
            <Link href="/auth/sign-up">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
