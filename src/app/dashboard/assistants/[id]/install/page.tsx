import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  publishAssistant,
  unpublishAssistant,
} from "@/app/dashboard/publish-actions";
import {
  getServerDictionary,
} from "@/i18n/server";
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

  const dictionary =
    await getServerDictionary();

  const copy =
    dictionary.dashboard.install;

  const selfServiceCopy =
    dictionary.dashboard.selfService;

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
        copy.errors.planCheckFailed,
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
        {copy.backToAssistant}
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
            {copy.eyebrow}
          </div>

          <h1
            className={
              dashboardStyles.pageTitle
            }
          >
            {copy.titleTemplate.replace(
              "{name}",
              assistant.name,
            )}
          </h1>

          <p
            className={
              dashboardStyles.pageLead
            }
          >
            {copy.intro}
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
            ? copy.proActive
            : copy.freePlan}
        </span>
      </div>

      {query.upgraded ? (
        <div
          className={
            styles.success
          }
          role="status"
        >
          {copy.upgradedNotice}
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
            {copy.websiteEmbed}
          </span>

          <h2>
            {isPro
              ? copy.unlockedTitle
              : copy.lockedTitle}
          </h2>

          <p>
            {isPro
              ? copy.unlockedBody
              : copy.lockedBody}
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
                {copy.playground}
              </span>

              <strong>
                {copy.included}
              </strong>
            </div>

            <div
              className={
                styles.featureRow
              }
            >
              <span>
                {copy.websiteEmbedFeature}
              </span>

              <strong>
                {isPro
                  ? copy.unlocked
                  : copy.pro}
              </strong>
            </div>

            <div
              className={
                styles.featureRow
              }
            >
              <span>
                {copy.monthlyMessages}
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
                {copy.knowledgeSources}
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
                ? copy.publishedNotice
                : copy.draftNotice}
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
                      {copy.publishAssistant}
                    </button>
                  </form>
                ) : (
                  <form
                    action={
                      unpublishAssistant
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
                        dashboardStyles.secondaryButton
                      }
                      type="submit"
                    >
                      {
                        selfServiceCopy
                          .unpublishAssistant
                      }
                    </button>
                  </form>
                )}

                <Link
                  className={
                    styles.secondaryLink
                  }
                  href={
                    `/dashboard/assistants/${assistant.id}`
                  }
                >
                  {copy.backToAssistantButton}
                </Link>
              </>
            ) : (
              <>
                {assistant.is_published ? (
                  <form
                    action={
                      unpublishAssistant
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
                        dashboardStyles.secondaryButton
                      }
                      type="submit"
                    >
                      {
                        selfServiceCopy
                          .unpublishAssistant
                      }
                    </button>
                  </form>
                ) : null}

                <Link
                  className={
                    styles.primaryLink
                  }
                  href={
                    `/dashboard/billing/upgrade?assistant=${assistant.id}`
                  }
                >
                  {copy.upgradeCta}
                </Link>

                <Link
                  className={
                    styles.secondaryLink
                  }
                  href={
                    `/dashboard/assistants/${assistant.id}/playground`
                  }
                >
                  {copy.keepTesting}
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
            {copy.assistantLabel}
          </span>

          <h2>
            {assistant.name}
          </h2>

          <p>
            {copy.assistantDescription}
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
                {copy.planLabel}
              </span>

              <strong>
                {isPro
                  ? copy.pro
                  : copy.freePlan}
              </strong>
            </div>

            <div
              className={
                styles.metaRow
              }
            >
              <span>
                {copy.assistantStatus}
              </span>

              <strong>
                {assistant.status === "ready"
                  ? copy.statusReady
                  : assistant.status === "archived"
                    ? copy.statusArchived
                    : copy.statusDraft}
              </strong>
            </div>

            <div
              className={
                styles.metaRow
              }
            >
              <span>
                {copy.publishingLabel}
              </span>

              <strong>
                {assistant.is_published
                  ? copy.published
                  : copy.notPublished}
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
                {copy.installationCode}
              </span>

              <h2>
                {copy.snippetTitle}
              </h2>

              <p>
                {copy.snippetHelp}
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
              {copy.openPreview}
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
              {copy.publicIdNote}
            </span>
          </div>
        </section>
      ) : null}

    </div>
  );
}
