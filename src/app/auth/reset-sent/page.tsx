import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";

import {
  getServerDictionary,
} from "@/i18n/server";

import styles from "../auth.module.css";

type PageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ResetSentPage({
  searchParams,
}: PageProps) {
  const copy =
    (
      await getServerDictionary()
    ).auth;

  const params =
    await searchParams;

  const email =
    params.email;

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
            {copy.resetSent.kicker}
          </span>

          <h1>
            {copy.resetSent.heroTitle}
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

          <h1>
            {copy.resetSent.title}
          </h1>

          <p>
            {copy.resetSent.accountPrefix}
            {email ? (
              <>
                {" "}
                <span className={styles.emailAddress}>
                  {email}
                </span>
              </>
            ) : null}
            ,{" "}
            {copy.resetSent.accountSuffix}
          </p>

          <Link
            className={styles.backLink}
            href="/auth/login"
          >
            {copy.resetSent.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
