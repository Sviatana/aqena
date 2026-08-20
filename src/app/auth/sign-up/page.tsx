import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/auth/actions";
import { PasswordInput } from "@/app/auth/password-input";
import { createClient } from "@/lib/supabase/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({
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
            Start with your knowledge
          </span>

          <h1>
            Build an assistant your customers can trust
          </h1>

          <p>
            Your first assistant is free to build and test.
            No credit card required.
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Create your account</h2>
            <p>
              Set up Anvera and build your first assistant
            </p>
          </header>

          <form
            action={signUp}
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
              <label htmlFor="displayName">
                Name
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                maxLength={80}
              />
            </div>

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
              <label htmlFor="password">
                Password
              </label>

              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              type="submit"
            >
              Create account
            </button>
          </form>

          <p className={styles.switch}>
            Already have an account?{" "}
            <Link href="/auth/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
