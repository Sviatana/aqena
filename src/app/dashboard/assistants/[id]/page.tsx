import BrandColorInput from "@/app/dashboard/brand-color-input";
import FileUploadField from "@/app/dashboard/file-upload-field";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  deleteAssistant,
  updateAssistant,
} from "@/app/dashboard/actions";

import {
  createTextKnowledgeSource,
  deleteKnowledgeSource,
  processKnowledgeSource,
} from "@/app/dashboard/knowledge-actions";
import {
  getServerDictionary,
} from "@/i18n/server";
import {
  knowledgeSourceLimit,
} from "@/lib/knowledge";
import {
  createClient,
} from "@/lib/supabase/server";

import styles from "../../dashboard.module.css";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
    created?: string;
  }>;
};

function formatBytes(
  value: number | null,
) {
  if (
    value === null
    || value < 0
  ) {
    return "";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (
    value
    < 1024 * 1024
  ) {
    return `${
      (value / 1024).toFixed(1)
    } KB`;
  }

  return `${
    (
      value
      / (1024 * 1024)
    ).toFixed(1)
  } MB`;
}

function statusLabel(
  value: string,
  copy: {
    statusPending: string;
    statusProcessing: string;
    statusReady: string;
    statusFailed: string;
  },
) {
  switch (value) {
    case "processing":
      return copy.statusProcessing;

    case "ready":
      return copy.statusReady;

    case "failed":
      return copy.statusFailed;

    default:
      return copy.statusPending;
  }
}

function sourceErrorLabel(
  value: string | null,
  copy: {
    pdfUnreadable: string;
    sourceTooLarge: string;
    pdfTimeout: string;
    processingFailed: string;
  },
) {
  if (!value) {
    return "";
  }

  if (
    value === "pdf_unreadable"
    || value.includes(
      "does not contain readable text",
    )
  ) {
    return copy.pdfUnreadable;
  }

  if (
    value === "source_too_large"
    || value.includes(
      "can contain up to",
    )
  ) {
    return copy.sourceTooLarge;
  }

  if (
    value === "pdf_timeout"
    || value.includes(
      "processing took too long",
    )
  ) {
    return copy.pdfTimeout;
  }

  return copy.processingFailed;
}

export default async function AssistantPage({
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
    dictionary.dashboard.detail;

  const knowledgeCopy =
    dictionary.dashboard.knowledge;

  const detailCopy =
    dictionary.dashboard.detail;

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
    redirect("/auth/login");
  }

  const [
    assistantResult,
    sourcesResult,
    subscriptionResult,
    sourceCountResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,name,description,instructions,welcome_message,fallback_message,brand_color,status,created_at",
      )
      .eq("id", id)
      .eq("owner_id", userId)
      .maybeSingle(),

    supabase
      .from("knowledge_sources")
      .select(
        "id,source_type,title,original_file_name,mime_type,size_bytes,status,error_message,created_at",
      )
      .eq(
        "assistant_id",
        id,
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
      .from("knowledge_sources")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "assistant_id",
        id,
      ),
  ]);

  if (
    assistantResult.error
    || !assistantResult.data
  ) {
    notFound();
  }

  const assistant =
    assistantResult.data;

  const sources =
    sourcesResult.data ?? [];

  const plan =
    subscriptionResult.data?.plan
      === "pro"
      ? "pro"
      : "free";

  const sourceLimit =
    knowledgeSourceLimit(plan);

  const sourceCount =
    sourceCountResult.count ?? 0;

  const limitReached =
    sourceCount >= sourceLimit;

  return (
    <div className={styles.content}>
      <Link
        className={styles.backLink}
        href="/dashboard"
      >
        {copy.backToAssistants}
      </Link>

      <div className={styles.detailHeading}>
        <div>
          <div className={styles.eyebrow}>
            {copy.eyebrow}
          </div>

          <h1 className={styles.pageTitle}>
            {assistant.name}
          </h1>

          <p className={styles.pageLead}>
            {assistant.description
              || copy.descriptionFallback}
          </p>
        </div>

        <div className={styles.detailQuota}>
          <span>
            {copy.knowledgeSources}
          </span>

          <strong>
            {sourceCount} / {sourceLimit}
          </strong>

          <small>
            {plan === "pro"
              ? copy.proPlan
              : copy.freePlan}
          </small>
        </div>
      </div>

      {query.created ? (
        <div
          className={styles.success}
          role="status"
        >
          {copy.createdNotice}
        </div>
      ) : null}

      {query.success ? (
        <div
          className={styles.success}
          role="status"
        >
          {query.success}
        </div>
      ) : null}

      {query.error ? (
        <div
          className={styles.error}
          role="alert"
        >
          {query.error}
        </div>
      ) : null}

      <details
        className={
          styles.settingsCard
        }
      >
        <summary
          className={
            styles.settingsSummary
          }
        >
          <div>
            <span>
              {copy.settingsTitle}
            </span>

            <strong>
              {copy.settingsSubtitle}
            </strong>
          </div>

          <small>
            {copy.editSettings}
          </small>
        </summary>

        <form
          action={
            updateAssistant.bind(
              null,
              assistant.id,
            )
          }
          className={
            styles.settingsForm
          }
        >
          <div
            className={
              styles.settingsGrid
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="assistant-name"
              >
                {copy.assistantName}
              </label>

              <input
                defaultValue={
                  assistant.name
                }
                id="assistant-name"
                maxLength={80}
                name="name"
                required
                type="text"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.assistantNameHint}
              </span>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="assistant-description"
              >
                {copy.description}
              </label>

              <textarea
                defaultValue={
                  assistant.description
                }
                id="assistant-description"
                maxLength={500}
                name="description"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.descriptionHint}
              </span>
            </div>

            <div
              className={
                `${styles.field} ${styles.settingsFull}`
              }
            >
              <label
                htmlFor="assistant-instructions"
              >
                {copy.instructions}
              </label>

              <textarea
                defaultValue={
                  assistant.instructions
                }
                id="assistant-instructions"
                maxLength={4000}
                name="instructions"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.instructionsHint}
              </span>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="assistant-welcome"
              >
                {copy.welcomeMessage}
              </label>

              <textarea
                defaultValue={
                  assistant.welcome_message
                }
                id="assistant-welcome"
                maxLength={500}
                name="welcomeMessage"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.welcomeHint}
              </span>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="assistant-fallback"
              >
                {copy.fallbackMessage}
              </label>

              <textarea
                defaultValue={
                  assistant.fallback_message
                }
                id="assistant-fallback"
                maxLength={500}
                name="fallbackMessage"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.fallbackHint}
              </span>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="assistant-brand-color"
              >
                {copy.brandColor}
              </label>

              <BrandColorInput
                defaultValue={
                  assistant.brand_color
                }
                id="assistant-brand-color"
                name="brandColor"
              />

              <span
                className={
                  styles.fieldHint
                }
              >
                {copy.brandHint}
              </span>
            </div>
          </div>

          <div
            className={
              styles.settingsFooter
            }
          >
            <p>
              {copy.changesNote}
            </p>

            <button
              className={
                styles.primaryButton
              }
              type="submit"
            >
              {copy.saveChanges}
            </button>
          </div>
        </form>
      </details>

      <section
        className={styles.selfServiceDangerZone}
        aria-labelledby="delete-assistant-title"
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

            <h2 id="delete-assistant-title">
              {
                selfServiceCopy
                  .deleteAssistantTitle
              }
            </h2>

            <p>
              {
                selfServiceCopy
                  .deleteAssistantBody
              }
            </p>
          </div>
        </div>

        <form
          action={
            deleteAssistant.bind(
              null,
              assistant.id,
            )
          }
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
                  .deleteAssistantConfirm
              }
            </span>
          </label>

          <button
            className={styles.dangerButton}
            type="submit"
          >
            {
              selfServiceCopy
                .deleteAssistantButton
            }
          </button>
        </form>
      </section>

      <section className={styles.knowledgeIntro}>
        <div>
          <div className={styles.eyebrow}>
            {knowledgeCopy.eyebrow}
          </div>

          <h2>
            {knowledgeCopy.title}
          </h2>

          <p>
            {knowledgeCopy.intro}
          </p>
        </div>

        {limitReached ? (
          <div className={styles.limitNotice}>
            {plan === "free"
              ? knowledgeCopy.freeLimitReached
              : knowledgeCopy.proLimitReached}
          </div>
        ) : null}
      </section>

      <section className={styles.playgroundLaunch}>
        <div>
          <span>
            {detailCopy.playgroundLauncherEyebrow}
          </span>

          <h2>
            {detailCopy.playgroundLauncherTitle}
          </h2>

          <p>
            {detailCopy.playgroundLauncherBody}
          </p>
        </div>

        <Link
          className={styles.playgroundLaunchButton}
          href={`/dashboard/assistants/${assistant.id}/playground`}
        >
          {detailCopy.playgroundLauncherOpen}
        </Link>
      </section>

      <section className={styles.playgroundLaunch}>
        <div>
          <span>
            {detailCopy.installLauncherEyebrow}
          </span>

          <h2>
            {detailCopy.installLauncherTitle}
          </h2>

          <p>
            {plan === "pro"
              ? detailCopy.installLauncherProBody
              : detailCopy.installLauncherFreeBody}
          </p>
        </div>

        <Link
          className={styles.playgroundLaunchButton}
          href={`/dashboard/assistants/${assistant.id}/install`}
        >
          {detailCopy.installLauncherOpen}
        </Link>
      </section>

      <div className={styles.knowledgeGrid}>
        <section className={styles.knowledgePanel}>
          <div className={styles.panelHeading}>
            <h2>
              {knowledgeCopy.uploadTitle}
            </h2>

            <p>
              {knowledgeCopy.uploadHint}
            </p>
          </div>

          <form
            action={`/api/assistants/${assistant.id}/knowledge/upload`}
            className={styles.knowledgeForm}
            encType="multipart/form-data"
            method="post"
          >
            <FileUploadField
              disabled={limitReached}
            />

            <button
              className={styles.primaryButton}
              disabled={limitReached}
              type="submit"
            >
              {knowledgeCopy.uploadButton}
            </button>
          </form>
        </section>

        <section className={styles.knowledgePanel}>
          <div className={styles.panelHeading}>
            <h2>
              {knowledgeCopy.addTextTitle}
            </h2>

            <p>
              {knowledgeCopy.addTextDescription}
            </p>
          </div>

          <form
            action={
              createTextKnowledgeSource.bind(
                null,
                assistant.id,
              )
            }
            className={styles.knowledgeForm}
          >
            <div className={styles.field}>
              <label htmlFor="source-title">
                {knowledgeCopy.sourceTitle}
              </label>

              <input
                disabled={limitReached}
                id="source-title"
                maxLength={120}
                name="title"
                placeholder={
                  knowledgeCopy.sourceTitlePlaceholder
                }
                required
                type="text"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="source-content">
                {knowledgeCopy.companyKnowledge}
              </label>

              <textarea
                className={styles.knowledgeTextarea}
                disabled={limitReached}
                id="source-content"
                maxLength={100000}
                name="content"
                placeholder={
                  knowledgeCopy.contentPlaceholder
                }
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              disabled={limitReached}
              type="submit"
            >
              {knowledgeCopy.addTextButton}
            </button>
          </form>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              {knowledgeCopy.sourcesTitle}
            </h2>

            <p className={styles.sectionDescription}>
              {knowledgeCopy.sourcesDescription}
            </p>
          </div>

          <span className={styles.sourceCounter}>
            {knowledgeCopy.sourceCounterTemplate.replace(
              "{count}",
              String(sources.length),
            )}
          </span>
        </div>

        {sources.length === 0 ? (
          <div className={styles.knowledgeEmpty}>
            <div
              className={styles.emptyMark}
              aria-hidden="true"
            >
              K
            </div>

            <h3>
              {knowledgeCopy.emptyTitle}
            </h3>

            <p>
              {knowledgeCopy.emptyBody}
            </p>
          </div>
        ) : (
          <div className={styles.sourceList}>
            {sources.map(
              (source) => {
                const sourceBytes =
                  formatBytes(
                    source.size_bytes,
                  );

                return (
                  <article
                    className={styles.sourceRow}
                    key={source.id}
                  >
                    <div className={styles.sourceMain}>
                      <div className={styles.sourceTitleRow}>
                        <h3>
                          {source.title}
                        </h3>

                        <span
                          className={styles.sourceStatus}
                          data-status={source.status}
                        >
                          {statusLabel(
                            source.status,
                            knowledgeCopy,
                          )}
                        </span>
                      </div>

                      <div className={styles.sourceMeta}>
                        <span>
                          {source.source_type === "file"
                            ? knowledgeCopy.typeDocument
                            : knowledgeCopy.typeText}
                        </span>

                        {source.original_file_name ? (
                          <span>
                            {source.original_file_name}
                          </span>
                        ) : null}

                        {sourceBytes ? (
                          <span>
                            {sourceBytes}
                          </span>
                        ) : null}
                      </div>

                      {source.status === "failed"
                        && source.error_message ? (
                          <p className={styles.sourceError}>
                            {sourceErrorLabel(
                              source.error_message,
                              knowledgeCopy.errors,
                            )}
                          </p>
                        ) : null}
                    </div>

                    <div className={styles.sourceActions}>
                      {source.status === "pending"
                        || source.status === "failed" ? (
                          <form
                            action={
                              processKnowledgeSource.bind(
                                null,
                                assistant.id,
                                source.id,
                              )
                            }
                          >
                            <button
                              className={styles.secondaryButton}
                              type="submit"
                            >
                              {source.status === "failed"
                                ? knowledgeCopy.retry
                                : knowledgeCopy.process}
                            </button>
                          </form>
                        ) : null}

                      <form
                        action={
                          deleteKnowledgeSource.bind(
                            null,
                            assistant.id,
                            source.id,
                          )
                        }
                      >
                        <button
                          className={styles.dangerButton}
                          type="submit"
                        >
                          {knowledgeCopy.remove}
                        </button>
                      </form>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}
