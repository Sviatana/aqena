import Link from "next/link";
import Script from "next/script";

import styles from "./demo.module.css";

const NORTHSTAR_PUBLIC_ID =
  "8a0f0c12-9b73-4554-94f1-4d83d8d731a4";

export default function NorthstarCoffeeDemo() {
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
            Northstar Coffee
          </strong>

          <nav
            aria-label="Demo navigation"
            className={
              styles.nav
            }
          >
            <span>
              Coffee
            </span>

            <span>
              Wholesale
            </span>

            <span>
              Visit
            </span>

            <span>
              Support
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
              Thoughtfully roasted coffee
            </p>

            <h1>
              Good coffee for everyday rituals
            </h1>

            <p
              className={
                styles.lead
              }
            >
              Small-batch coffee, straightforward shipping and support
              from people who care about the cup. Use the assistant in
              the lower-right corner if you have a question.
            </p>

            <Link
              className={
                styles.backLink
              }
              href="/"
            >
              Back to Anvera
            </Link>
          </section>

          <aside
            className={
              styles.feature
            }
          >
            <span>
              Northstar Coffee
            </span>

            <div>
              <h2>
                Coffee worth slowing down for
              </h2>

              <p>
                Roasted with care and shipped with clear,
                simple policies.
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
