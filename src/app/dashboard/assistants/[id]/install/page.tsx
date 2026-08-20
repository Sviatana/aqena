import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  publishAssistant,
} from "@/app/dashboard/publish-actions";
import {
  createClient,
} from "@/lib/supabase/server";

import CopySnippetButton from "./copy-snippet-button";
import dashboardStyles from "../../../dashboard.module.css";
import styles from "./install.module.css";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    upgraded?: string;
    success?: string;
    error?: string;
  }>;
};

export default async function InstallPage({
  params,
  searchParams,
}: PageProps) {
  const {
    id,
  } = await params;

  const query =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError
    || !userId
  ) {
    redirect(
      "/auth/login",
    );
  }

  const [
    assistantResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,name,description,status,is_published,public_id",
      )
      .eq(
        "id",
        id,
      )
      .eq(
        "owner_id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select(
        "plan,status,billing_mode",
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  if (
    assistantResult.error
    || !assistantResult.data
  ) {
    notFound();
  }

  if (
    subscriptionResult.error
  ) {
    redirect(
      `/dashboard/assistants/${id}?error=${encodeURIComponent(
        "We could not check your plan.",
      )}`,
    );
  }

  const assistant =
    assistantResult.data;

  const siteUrl =
    (
      process.env.NEXT_PUBLIC_SITE_URL
      || "http://localhost:3000"
    ).replace(
      /\/$/,
      "",
    );

  const embedSnippet =
    `<script src="${siteUrl}/widget.js" data-assistant-id="${assistant.public_id}" async></script>`;

  const subscription =
    subscriptionResult.data;

  const isPro =
    subscription?.plan
      === "pro"
    && subscription?.status
      === "active";

  return (
    <div
      className={
        dashboardStyles.content
      }
    >
      <Link
        className={
          dashboardStyles.backLink
        }
        href={
          `/dashboard/assistants/${assistant.id}`
        }
      >
        ← Back to assistant
      </Link>

      <div
        className={
          styles.statusRow
        }
      >
        <div>
          <div
            className={
              dashboardStyles.eyebrow
            }
          >
            Install
          </div>

          <h1
            className={
              dashboardStyles.pageTitle
            }
          >
            Add {assistant.name} to your website
          </h1>

          <p
            className={
              dashboardStyles.pageLead
            }
          >
            Publish your assistant, copy one embed snippet
            and place it on the site where customers need help
          </p>
        </div>

        <span
          className={
            isPro
              ? styles.planBadge
              : `${styles.planBadge} ${styles.planBadgeLocked}`
          }
        >
          {isPro
            ? "Pro active"
            : "Free plan"}
        </span>
      </div>

      {query.upgraded ? (
        <div
          className={
            styles.success
          }
          role="status"
        >
          Pro is active. Website installation is now unlocked.
        </div>
      ) : null}

      {query.success ? (
        <div
          className={
            styles.success
          }
          role="status"
        >
          {query.success}
        </div>
      ) : null}

      {query.error ? (
        <div
          className={
            dashboardStyles.error
          }
          role="alert"
        >
          {query.error}
        </div>
      ) : null}

      <div
        className={
          styles.grid
        }
      >
        <section
          className={
            styles.card
          }
        >
          <div
            className={
              isPro
                ? styles.readyMark
                : styles.lockedMark
            }
            aria-hidden="true"
          >
            {isPro
              ? "✓"
              : "×"}
          </div>

          <span
            className={
              styles.kicker
            }
          >
            Website embed
          </span>

          <h2>
            {isPro
              ? "Website installation unlocked"
              : "Website installation is a Pro feature"}
          </h2>

          <p>
            {isPro
              ? "Your plan now includes website embedding. The next setup step is to publish this assistant and generate its installation code."
              : "Playground testing stays available on Free. Upgrade to Pro when you are ready to place the assistant on a live website."}
          </p>

          <div
            className={
              styles.featureList
            }
          >
            <div
              className={
                styles.featureRow
              }
            >
              <span>
                Playground
              </span>

              <strong>
                Included
              </strong>
            </div>

            <div
              className={
                styles.featureRow
              }
            >
              <span>
                Website embed
              </span>

              <strong>
                {isPro
                  ? "Unlocked"
                  : "Pro"}
              </strong>
            </div>

            <div
              className={
                styles.featureRow
              }
            >
              <span>
                Monthly messages
              </span>

              <strong>
                {isPro
                  ? "2,000"
                  : "50"}
              </strong>
            </div>

            <div
              className={
                styles.featureRow
              }
            >
              <span>
                Knowledge sources
              </span>

              <strong>
                {isPro
                  ? "100"
                  : "3"}
              </strong>
            </div>
          </div>

          {isPro ? (
            <div
              className={
                styles.notice
              }
            >
              {assistant.is_published
                ? "This assistant is published and ready for embed setup."
                : "This assistant is still a draft. Publishing will create the public installation endpoint used by the website widget."}
            </div>
          ) : null}

          <div
            className={
              styles.actions
            }
          >
            {isPro ? (
              <>
                {!assistant.is_published ? (
                  <form
                    action={
                      publishAssistant
                    }
                  >
                    <input
                      name="assistantId"
                      type="hidden"
                      value={
                        assistant.id
                      }
                    />

                    <button
                      className={
                        dashboardStyles.primaryButton
                      }
                      type="submit"
                    >
                      Publish assistant
                    </button>
                  </form>
                ) : null}

                <Link
                  className={
                    styles.secondaryLink
                  }
                  href={
                    `/dashboard/assistants/${assistant.id}`
                  }
                >
                  Back to assistant
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={
                    styles.primaryLink
                  }
                  href={
                    `/dashboard/billing/upgrade?assistant=${assistant.id}`
                  }
                >
                  Upgrade to Pro — $29/month
                </Link>

                <Link
                  className={
                    styles.secondaryLink
                  }
                  href={
                    `/dashboard/assistants/${assistant.id}/playground`
                  }
                >
                  Keep testing
                </Link>
              </>
            )}
          </div>
        </section>

        <aside
          className={
            styles.sideCard
          }
        >
          <span
            className={
              styles.kicker
            }
          >
            Assistant
          </span>

          <h2>
            {assistant.name}
          </h2>

          <p>
            Installation access follows the workspace plan,
            while publishing is controlled per assistant
          </p>

          <div
            className={
              styles.meta
            }
          >
            <div
              className={
                styles.metaRow
              }
            >
              <span>
                Plan
              </span>

              <strong>
                {isPro
                  ? "Pro"
                  : "Free"}
              </strong>
            </div>

            <div
              className={
                styles.metaRow
              }
            >
              <span>
                Assistant status
              </span>

              <strong>
                {assistant.status === "ready"
                  ? "Ready"
                  : assistant.status === "archived"
                    ? "Archived"
                    : "Draft"}
              </strong>
            </div>

            <div
              className={
                styles.metaRow
              }
            >
              <span>
                Publishing
              </span>

              <strong>
                {assistant.is_published
                  ? "Published"
                  : "Not published"}
              </strong>
            </div>
          </div>
        </aside>
      </div>

      {isPro
        && assistant.is_published ? (
        <section
          className={
            styles.snippetCard
          }
        >
          <div
            className={
              styles.snippetHeading
            }
          >
            <div>
              <span
                className={
                  styles.kicker
                }
              >
                Installation code
              </span>

              <h2>
                Add your AI assistant to your website
              </h2>

              <p>
                Paste this script before the closing body tag on the page
                where you want the assistant to appear
              </p>
            </div>

            <Link
              className={
                styles.secondaryLink
              }
              href={
                `/embed/${assistant.public_id}?returnTo=${
                  encodeURIComponent(
                    `/dashboard/assistants/${assistant.id}/install`,
                  )
                }`
              }
              rel="noreferrer"
              target="_blank"
            >
              Open preview
            </Link>
          </div>

          <pre
            className={
              styles.codeBlock
            }
          >
            <code>
              {embedSnippet}
            </code>
          </pre>

          <div
            className={
              styles.snippetActions
            }
          >
            <CopySnippetButton
              className={
                styles.copyButton
              }
              snippet={
                embedSnippet
              }
            />

            <span>
              Uses the public assistant ID only. No private keys are included.
            </span>
          </div>
        </section>
      ) : null}

    </div>
  );
}
