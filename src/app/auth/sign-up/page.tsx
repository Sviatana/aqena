import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/auth/actions";
import { PasswordInput } from "@/app/auth/password-input";
import {
  getServerDictionary,
} from "@/i18n/server";
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
            {copy.signUp.kicker}
          </span>

          <h1>
            {copy.signUp.heroTitle}
          </h1>

          <p>
            {copy.signUp.heroBody}
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>
              {copy.signUp.title}
            </h2>

            <p>
              {copy.signUp.subtitle}
            </p>
          </header>

          <form
            action={signUp}
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
              <label htmlFor="displayName">
                {copy.common.name}
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
              <label htmlFor="password">
                {copy.common.password}
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
              {copy.signUp.submit}
            </button>
          </form>

          <p className={styles.switch}>
            {copy.signUp.alreadyHaveAccount}{" "}
            <Link href="/auth/login">
              {copy.signUp.signIn}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
