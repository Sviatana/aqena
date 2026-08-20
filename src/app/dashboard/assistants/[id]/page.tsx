import BrandColorInput from "@/app/dashboard/brand-color-input";
import FileUploadField from "@/app/dashboard/file-upload-field";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  updateAssistant,
} from "@/app/dashboard/actions";

import {
  createTextKnowledgeSource,
  deleteKnowledgeSource,
  processKnowledgeSource,
} from "@/app/dashboard/knowledge-actions";
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
) {
  switch (value) {
    case "processing":
      return "Processing";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
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
        ← Back to assistants
      </Link>

      <div className={styles.detailHeading}>
        <div>
          <div className={styles.eyebrow}>
            Assistant
          </div>

          <h1 className={styles.pageTitle}>
            {assistant.name}
          </h1>

          <p className={styles.pageLead}>
            {assistant.description
              || "Add company knowledge for this assistant to use in its answers."}
          </p>
        </div>

        <div className={styles.detailQuota}>
          <span>
            Knowledge sources
          </span>

          <strong>
            {sourceCount} / {sourceLimit}
          </strong>

          <small>
            {plan === "pro"
              ? "Pro plan"
              : "Free plan"}
          </small>
        </div>
      </div>

      {query.created ? (
        <div
          className={styles.success}
          role="status"
        >
          Assistant created. Add its company knowledge next.
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
              Assistant settings
            </span>

            <strong>
              Customize behavior and customer messages
            </strong>
          </div>

          <small>
            Edit settings
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
                Assistant name
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
                Customers see this name in the website chat
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
                Description
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
                A short workspace description of this assistant
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
                Instructions
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
                Define tone and answer boundaries. Leaving this empty restores
                Anvera&apos;s safe knowledge-only instructions
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
                Welcome message
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
                The first message customers see when the chat opens
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
                Fallback message
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
                Used when the company knowledge does not support an answer
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
                Brand color
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
                Choose the color your business uses in the website chat
              </span>
            </div>
          </div>

          <div
            className={
              styles.settingsFooter
            }
          >
            <p>
              Changes apply to Playground and website chat without changing
              your installation code
            </p>

            <button
              className={
                styles.primaryButton
              }
              type="submit"
            >
              Save changes
            </button>
          </div>
        </form>
      </details>

      <section className={styles.knowledgeIntro}>
        <div>
          <div className={styles.eyebrow}>
            Knowledge
          </div>

          <h2>
            Add company knowledge
          </h2>

          <p>
            Upload company documents or paste text that
            this assistant should use when answering.
          </p>
        </div>

        {limitReached ? (
          <div className={styles.limitNotice}>
            {plan === "free"
              ? "You have used all 3 sources included in the Free plan."
              : "You have reached the 100-source Pro limit."}
          </div>
        ) : null}
      </section>

      <section className={styles.playgroundLaunch}>
        <div>
          <span>Playground</span>
          <h2>Test this assistant</h2>
          <p>
            Ask real questions, inspect grounded answers
            and review the sources Anvera used
          </p>
        </div>

        <Link
          className={styles.playgroundLaunchButton}
          href={`/dashboard/assistants/${assistant.id}/playground`}
        >
          Open Playground
        </Link>
      </section>

      <section className={styles.playgroundLaunch}>
        <div>
          <span>
            Install
          </span>

          <h2>
            Put this assistant on your website
          </h2>

          <p>
            {plan === "pro"
              ? "Website installation is unlocked. Continue setup and prepare this assistant for publishing"
              : "Website embedding is available on Pro. Review the install flow and upgrade when you are ready"}
          </p>
        </div>

        <Link
          className={styles.playgroundLaunchButton}
          href={`/dashboard/assistants/${assistant.id}/install`}
        >
          Open Install
        </Link>
      </section>

      <div className={styles.knowledgeGrid}>
        <section className={styles.knowledgePanel}>
          <div className={styles.panelHeading}>
            <h2>
              Upload document
            </h2>

            <p>
              PDF, TXT or Markdown up to 5 MB
            </p>
          </div>

          <form
            action={
              `/api/assistants/${assistant.id}/knowledge/upload`
            }
            className={styles.knowledgeForm}
            encType="multipart/form-data"
            method="post"
          >
            <FileUploadField disabled={limitReached} />

            <button
              className={styles.primaryButton}
              disabled={limitReached}
              type="submit"
            >
              Upload document
            </button>
          </form>
        </section>

        <section className={styles.knowledgePanel}>
          <div className={styles.panelHeading}>
            <h2>
              Add text
            </h2>

            <p>
              Paste policies, FAQs, product notes or other
              company information
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
                Source title
              </label>

              <input
                disabled={limitReached}
                id="source-title"
                maxLength={120}
                name="title"
                placeholder="Store policies"
                required
                type="text"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="source-content">
                Company knowledge
              </label>

              <textarea
                className={styles.knowledgeTextarea}
                disabled={limitReached}
                id="source-content"
                maxLength={100000}
                name="content"
                placeholder="Paste the information this assistant should know..."
                required
              />
            </div>

            <button
              className={styles.primaryButton}
              disabled={limitReached}
              type="submit"
            >
              Add text source
            </button>
          </form>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              Knowledge sources
            </h2>

            <p className={styles.sectionDescription}>
              Sources will move through Pending,
              Processing, Ready or Failed as Anvera
              prepares them for answers.
            </p>
          </div>

          <span className={styles.sourceCounter}>
            {sources.length} for this assistant
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
              No knowledge sources yet
            </h3>

            <p>
              Upload a document or add text above to
              build this assistant&apos;s knowledge.
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
                          )}
                        </span>
                      </div>

                      <div className={styles.sourceMeta}>
                        <span>
                          {source.source_type === "file"
                            ? "Document"
                            : "Text"}
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
                            {source.error_message}
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
                                ? "Retry"
                                : "Process"}
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
                          Remove
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
