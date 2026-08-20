import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ResetSentPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const email = params.email;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link
          aria-label="Anvera home"
          className={styles.logo}
          href="/"
        >
          <AnveraLogo
            width={108}
          />
        </Link>

        <div className={styles.brandCopy}>
          <span className={styles.kicker}>
            Password recovery
          </span>

          <h1>
            Check your inbox for the reset link
          </h1>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.emailCard}>
          <div
            className={styles.emailIcon}
            aria-hidden="true"
          >
            ✉
          </div>

          <h1>Reset link sent</h1>

          <p>
            If an Anvera account exists for
            {email ? (
              <>
                {" "}
                <span className={styles.emailAddress}>
                  {email}
                </span>
              </>
            ) : null}
            , you will receive an email with a secure password reset link.
          </p>

          <Link
            className={styles.backLink}
            href="/auth/login"
          >
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
