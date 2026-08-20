import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CheckEmailPage({
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
            Almost ready
          </span>

          <h1>
            One quick step before your first assistant
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

          <h1>Check your inbox</h1>

          <p>
            We sent a confirmation link
            {email ? (
              <>
                {" "}to{" "}
                <span className={styles.emailAddress}>
                  {email}
                </span>
              </>
            ) : null}
            . Open the link to finish creating your account.
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
