import Script from "next/script";

import {
  getServerDictionary,
} from "@/i18n/server";

import styles from "./demo.module.css";

const NORTHSTAR_PUBLIC_ID =
  "8a0f0c12-9b73-4554-94f1-4d83d8d731a4";

export default async function NorthstarCoffeeDemo() {
  const copy =
    (
      await getServerDictionary()
    ).demo.northstar;

  return (
    <>
      <div
        className={
          styles.page
        }
      >
        <header
          className={
            styles.header
          }
        >
          <strong
            className={
              styles.brand
            }
          >
            {copy.brand}
          </strong>

          <nav
            aria-label={
              copy.navigationAria
            }
            className={
              styles.nav
            }
          >
            <span>
              {copy.navCoffee}
            </span>

            <span>
              {copy.navWholesale}
            </span>

            <span>
              {copy.navVisit}
            </span>

            <span>
              {copy.navSupport}
            </span>

          </nav>
        </header>

        <main
          className={
            styles.main
          }
        >
          <section
            className={
              styles.copy
            }
          >
            <p
              className={
                styles.eyebrow
              }
            >
              {copy.eyebrow}
            </p>

            <h1>
              {copy.title}
            </h1>

            <p
              className={
                styles.lead
              }
            >
              {copy.lead}
            </p>

            {/* Full reload removes the demo widget injected outside React. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              className={
                styles.backLink
              }
              href="/"
            >
              {copy.backToAnvera}
            </a>
          </section>

          <aside
            className={
              styles.feature
            }
          >
            <span>
              {copy.brand}
            </span>

            <div>
              <h2>
                {copy.featureTitle}
              </h2>

              <p>
                {copy.featureBody}
              </p>
            </div>
          </aside>
        </main>
      </div>

      <Script
        async
        data-assistant-id={
          NORTHSTAR_PUBLIC_ID
        }
        src="/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
