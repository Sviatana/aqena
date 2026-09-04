import Link from "next/link";
import { redirect } from "next/navigation";

import {
  deleteAccount,
} from "@/app/dashboard/actions";

import {
  getServerDictionary,
  getServerLocale,
} from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

import styles from "./dashboard.module.css";

type PageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    accountError?: string;
  }>;
};

function assistantStatusLabel(
  status: string,
  copy: {
    statusDraft: string;
    statusReady: string;
    statusArchived: string;
  },
) {
  switch (status) {
    case "ready":
      return copy.statusReady;

    case "archived":
      return copy.statusArchived;

    case "draft":
    default:
      return copy.statusDraft;
  }
}

export default async function DashboardPage({
  searchParams,
}: PageProps) {
  const [
    dictionary,
    locale,
  ] = await Promise.all([
    getServerDictionary(),
    getServerLocale(),
  ]);

  const copy =
    dictionary.dashboard.home;

  const selfServiceCopy =
    dictionary.dashboard.selfService;

  const numberLocale =
    locale === "ru"
      ? "ru-RU"
      : "en-US";

  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const [
    assistantsResult,
    subscriptionResult,
    usageResult,
    knowledgeResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,name,description,status,is_published,created_at",
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("usage_monthly")
      .select("message_count,month")
      .eq("user_id", userId)
      .order(
        "month",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle(),

    supabase
      .from("knowledge_sources")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),
  ]);

  const assistants =
    assistantsResult.data ?? [];

  const plan =
    subscriptionResult.data?.plan
      === "pro"
      ? "pro"
      : "free";

  const limit =
    plan === "pro"
      ? 5
      : 1;

  const messageLimit =
    plan === "pro"
      ? 2000
      : 50;

  const messages =
    usageResult.data?.message_count
    ?? 0;

  const knowledgeSources =
    knowledgeResult.count
    ?? 0;

  const params =
    await searchParams;

  return (
    <div className={styles.content}>
      <div className={styles.headingRow}>
        <div>
          <div className={styles.eyebrow}>
            {copy.eyebrow}
          </div>

          <h1 className={styles.pageTitle}>
            {copy.title}
          </h1>

          <p className={styles.pageLead}>
            {copy.lead}
          </p>
        </div>
      </div>

      {params.created ? (
        <div
          className={styles.success}
          role="status"
        >
          {copy.createdNotice}
        </div>
      ) : null}

      {params.deleted ? (
        <div
          className={styles.success}
          role="status"
        >
          {
            selfServiceCopy
              .assistantDeletedSuccess
          }
        </div>
      ) : null}

      {params.accountError ? (
        <div
          className={styles.error}
          role="alert"
        >
          {params.accountError}
        </div>
      ) : null}

      <section
        className={styles.stats}
        aria-label={copy.accountUsageLabel}
      >
        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            {copy.assistantsStat}
          </div>

          <div className={styles.statValue}>
            {assistants.length} / {limit}
          </div>

          <div className={styles.statMeta}>
            {plan === "pro"
              ? copy.proPlan
              : copy.freePlan}
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            {copy.messagesThisMonth}
          </div>

          <div className={styles.statValue}>
            {messages.toLocaleString(
              numberLocale,
            )}{" "}
            /{" "}
            {messageLimit.toLocaleString(
              numberLocale,
            )}
          </div>

          <div className={styles.statMeta}>
            {copy.playgroundAndWebsite}
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            {copy.knowledgeSources}
          </div>

          <div className={styles.statValue}>
            {knowledgeSources.toLocaleString(
              numberLocale,
            )}
          </div>

          <div className={styles.statMeta}>
            {copy.addDocuments}
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            {copy.assistantsSection}
          </h2>
        </div>

        {assistants.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyInner}>
              <div
                className={styles.emptyMark}
                aria-hidden="true"
              >
                A
              </div>

              <h3>
                {copy.emptyTitle}
              </h3>

              <p>
                {copy.emptyBody}
              </p>

              <Link
                className={styles.newButton}
                href="/dashboard/assistants/new"
              >
                {copy.createAssistant}
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.assistantList}>
            {assistants.map(
              (assistant) => (
                <Link
                  className={`${styles.assistantCard} ${styles.assistantLink}`}
                  href={`/dashboard/assistants/${assistant.id}`}
                  key={assistant.id}
                >
                  <div>
                    <h3
                      className={
                        styles.assistantName
                      }
                    >
                      {assistant.name}
                    </h3>

                    <p
                      className={
                        styles.assistantDescription
                      }
                    >
                      {assistant.description
                        || copy.noDescription}
                    </p>
                  </div>

                  <div className={styles.assistantCardSide}>
                    <span className={styles.badge}>
                      {assistantStatusLabel(
                        assistant.status,
                        copy,
                      )}
                    </span>

                    <span className={styles.openAssistant}>
                      {copy.open}
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </section>

      <section
        className={styles.selfServiceDangerZone}
        aria-labelledby="delete-account-title"
      >
        <div
          className={
            styles.selfServiceDangerHeader
          }
        >
          <div>
            <div className={styles.eyebrow}>
              {selfServiceCopy.dangerZone}
            </div>

            <h2 id="delete-account-title">
              {
                selfServiceCopy
                  .deleteAccountTitle
              }
            </h2>

            <p>
              {
                selfServiceCopy
                  .deleteAccountBody
              }
            </p>
          </div>
        </div>

        <form
          action={deleteAccount}
          className={
            styles.selfServiceDangerForm
          }
        >
          <label
            className={
              styles.selfServiceConfirmation
            }
          >
            <input
              name="confirmDelete"
              required
              type="checkbox"
              value="1"
            />

            <span>
              {
                selfServiceCopy
                  .deleteAccountConfirm
              }
            </span>
          </label>

          <button
            className={styles.dangerButton}
            type="submit"
          >
            {
              selfServiceCopy
                .deleteAccountButton
            }
          </button>
        </form>
      </section>
    </div>
  );
}
