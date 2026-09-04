import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  clearPlaygroundChat,
  sendPlaygroundMessage,
} from "@/app/dashboard/playground-actions";

import {
  getServerDictionary,
} from "@/i18n/server";
import {
  createClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/types/database";

import styles from "../../../dashboard.module.css";

import {
  PlaygroundClearButton,
} from "./clear-chat-button";

import {
  PlaygroundSubmitButton,
} from "./submit-button";
import {
  PlaygroundQuestionField,
} from "./question-field";
import {
  PlaygroundPendingMessage,
} from "./pending-message";


type PageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};


type CitationView = {
  sourceId: string;
  sourceTitle: string;
  chunkId: string;
  similarity: number;
};


function parseCitations(
  value: Json,
): CitationView[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value.flatMap(
    (item) => {
      if (
        !item
        || typeof item
          !== "object"
        || Array.isArray(item)
      ) {
        return [];
      }

      const sourceId =
        item.sourceId;

      const sourceTitle =
        item.sourceTitle;

      const chunkId =
        item.chunkId;

      const similarity =
        item.similarity;

      if (
        typeof sourceId
          !== "string"
        || typeof sourceTitle
          !== "string"
        || typeof chunkId
          !== "string"
        || typeof similarity
          !== "number"
      ) {
        return [];
      }

      return [{
        sourceId,
        sourceTitle,
        chunkId,
        similarity,
      }];
    },
  );
}


function currentMonth() {
  return (
    new Date()
      .toISOString()
      .slice(
        0,
        7,
      )
    + "-01"
  );
}


export default async function PlaygroundPage({
  params,
  searchParams,
}: PageProps) {
  const {
    id,
  } =
    await params;

  const query =
    await searchParams;

  const copy =
    (
      await getServerDictionary()
    ).dashboard.playground;

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData
      ?.claims
      ?.sub;

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
    usageResult,
    readySourcesResult,
    conversationResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "assistants",
        )
        .select(
          "id,name,description,welcome_message,fallback_message,status",
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
        .from(
          "subscriptions",
        )
        .select(
          "plan,status",
        )
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle(),

      supabase
        .from(
          "usage_monthly",
        )
        .select(
          "message_count,playground_message_count",
        )
        .eq(
          "user_id",
          userId,
        )
        .eq(
          "month",
          currentMonth(),
        )
        .maybeSingle(),

      supabase
        .from(
          "knowledge_sources",
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          },
        )
        .eq(
          "assistant_id",
          id,
        )
        .eq(
          "status",
          "ready",
        ),

      supabase
        .from(
          "conversations",
        )
        .select(
          "id",
        )
        .eq(
          "assistant_id",
          id,
        )
        .eq(
          "user_id",
          userId,
        )
        .eq(
          "channel",
          "playground",
        )
        .maybeSingle(),
    ]);

  const assistant =
    assistantResult.data;

  if (
    assistantResult.error
    || !assistant
  ) {
    redirect(
      "/dashboard",
    );
  }

  const subscription =
    subscriptionResult.data;

  const isPro =
    subscription?.plan
      === "pro"
    && subscription.status
      === "active";

  const messageLimit =
    isPro
      ? 2000
      : 50;

  const messageCount =
    usageResult.data
      ?.message_count
    ?? 0;

  const playgroundCount =
    usageResult.data
      ?.playground_message_count
    ?? 0;

  const readySourceCount =
    readySourcesResult.count
    ?? 0;

  const conversation =
    conversationResult.data;

  let messages:
    Array<{
      id: string;
      role: string;
      content: string;
      citations: Json;
      created_at: string;
    }> = [];

  if (conversation) {
    const {
      data,
      error,
    } = await supabase
      .from(
        "messages",
      )
      .select(
        "id,role,content,citations,created_at",
      )
      .eq(
        "conversation_id",
        conversation.id,
      )
      .in(
        "role",
        [
          "user",
          "assistant",
        ],
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(
        8,
      );

    if (!error) {
      messages =
        (data ?? [])
          .slice()
          .reverse();
    }
  }

  const limitReached =
    messageCount
    >= messageLimit;

  const knowledgeReady =
    readySourceCount
    > 0;

  const formDisabled =
    limitReached
    || !knowledgeReady;

  return (
    <div
      className={
        styles.playgroundPage
      }
    >
      <div
        className={
          styles.playgroundTopbar
        }
      >
        <Link
          className={
            styles.playgroundBack
          }
          href={
            `/dashboard/assistants/${assistant.id}`
          }
        >
          {copy.backToAssistant}
        </Link>

        <div
          className={
            styles.playgroundTopbarActions
          }
        >
          {conversation ? (
            <form
              action={
                clearPlaygroundChat.bind(
                  null,
                  assistant.id,
                )
              }
            >
              <PlaygroundClearButton />
            </form>
          ) : null}

          <span
            className={
              styles.playgroundPlan
            }
          >
            {isPro
              ? copy.proPlan
              : copy.freePlan}
          </span>
        </div>
      </div>

      <header
        className={
          styles.playgroundHeader
        }
      >
        <div>
          <span
            className={
              styles.playgroundEyebrow
            }
          >
            {copy.eyebrow}
          </span>

          <h1>
            {assistant.name}
          </h1>

          <p>
            {copy.intro}
          </p>
        </div>

        <div
          className={
            styles.playgroundUsage
          }
        >
          <span>
            {copy.messagesThisMonth}
          </span>

          <strong>
            {messageCount}
            {" / "}
            {messageLimit}
          </strong>

          <small>
            {copy.sentFromTemplate.replace(
              "{count}",
              String(playgroundCount),
            )}
          </small>
        </div>
      </header>

      {query.success ? (
        <div
          className={
            styles.playgroundNotice
          }
          data-kind="success"
          role="status"
        >
          {query.success}
        </div>
      ) : null}

      {query.error ? (
        <div
          className={
            styles.playgroundNotice
          }
          data-kind="error"
        >
          {query.error}
        </div>
      ) : null}

      {!knowledgeReady ? (
        <div
          className={
            styles.playgroundNotice
          }
          data-kind="warning"
        >
          {copy.knowledgeRequired}
        </div>
      ) : null}

      {limitReached ? (
        <div
          className={
            styles.playgroundNotice
          }
          data-kind="warning"
        >
          {isPro
            ? copy.proLimitReached
            : copy.freeLimitReached}
        </div>
      ) : null}

      <main
        className={
          styles.playgroundShell
        }
      >
        <section
          className={
            styles.playgroundConversation
          }
        >
          <form
            action={
              sendPlaygroundMessage.bind(
                null,
                assistant.id,
              )
            }
            className={
              styles.playgroundForm
            }
          >
            {messages.length
            === 0 ? (
              <div
                className={
                  styles.playgroundWelcome
                }
              >
                <span
                  aria-hidden="true"
                >
                  A
                </span>

                <h2>
                  {copy.startConversation}
                </h2>

                <p>
                  {assistant.welcome_message
                  || copy.welcomeFallback}
                </p>
              </div>
            ) : (
              <div
                className={
                  styles.playgroundMessages
                }
              >
                {messages.map(
                  (message) => {
                    const citations =
                      parseCitations(
                        message.citations,
                      );

                    const assistantMessage =
                      message.role
                      === "assistant";

                    return (
                      <article
                        className={
                          styles.playgroundMessage
                        }
                        data-role={
                          assistantMessage
                            ? "assistant"
                            : "user"
                        }
                        key={
                          message.id
                        }
                      >
                        <div
                          className={
                            styles.playgroundMessageLabel
                          }
                        >
                          {assistantMessage
                            ? assistant.name
                            : copy.you}
                        </div>

                        <div
                          className={
                            styles.playgroundBubble
                          }
                        >
                          <p>
                            {message.content}
                          </p>

                          {assistantMessage
                            && citations.length
                              > 0 ? (
                                <details
                                  className={
                                    styles.playgroundSources
                                  }
                                >
                                  <summary>
                                    {copy.sources}
                                  </summary>

                                  <div
                                    className={
                                      styles.playgroundSourceList
                                    }
                                  >
                                    {citations.map(
                                      (
                                        citation,
                                        index,
                                      ) => (
                                        <div
                                          className={
                                            styles.playgroundSource
                                          }
                                          key={
                                            citation.chunkId
                                          }
                                        >
                                          <span>
                                            {index + 1}
                                          </span>

                                          <div>
                                            <strong>
                                              {citation.sourceTitle}
                                            </strong>

                                            <small>
                                              {copy.knowledgeSource}
                                            </small>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </details>
                              ) : null}
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}

            <PlaygroundPendingMessage />

            <div
              className={
                styles.playgroundComposer
              }
            >
              <PlaygroundQuestionField
                disabled={
                  formDisabled
                }
                knowledgeReady={
                  knowledgeReady
                }
              />

              <div
                className={
                  styles.playgroundComposerFooter
                }
              >
                <small>
                  {copy.composerNote}
                </small>

                <PlaygroundSubmitButton
                  disabled={
                    formDisabled
                  }
                />
              </div>
            </div>
          </form>
        </section>

        <aside
          className={
            styles.playgroundSide
          }
        >
          <div
            className={
              styles.playgroundSideCard
            }
          >
            <span>
              {copy.readySources}
            </span>

            <strong>
              {readySourceCount}
            </strong>

            <p>
              {copy.readySourcesDescription}
            </p>
          </div>

          <div
            className={
              styles.playgroundSideCard
            }
          >
            <span>
              {copy.context}
            </span>

            <strong>
              {copy.lastEightMessages}
            </strong>

            <p>
              {copy.contextDescription}
            </p>
          </div>

          <div
            className={
              styles.playgroundSideCard
            }
          >
            <span>
              {copy.knowledgeSearch}
            </span>

            <strong>
              {copy.bestFiveMatches}
            </strong>

            <p>
              {copy.knowledgeSearchDescription}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
