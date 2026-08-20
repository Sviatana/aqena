import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  clearPlaygroundChat,
  sendPlaygroundMessage,
} from "@/app/dashboard/playground-actions";

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
          ← Back to assistant
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
              ? "Pro"
              : "Free"}
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
            Playground
          </span>

          <h1>
            {assistant.name}
          </h1>

          <p>
            Test grounded answers against this
            assistant&apos;s ready knowledge sources
          </p>
        </div>

        <div
          className={
            styles.playgroundUsage
          }
        >
          <span>
            Messages this month
          </span>

          <strong>
            {messageCount}
            {" / "}
            {messageLimit}
          </strong>

          <small>
            {playgroundCount}
            {" "}
            sent from Playground
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
          Process at least one knowledge source
          before asking questions
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
            ? "You have reached your monthly Pro message limit"
            : "You have used all 50 Free messages for this month"}
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
                  Start a conversation
                </h2>

                <p>
                  {assistant.welcome_message
                  || "Ask a question about the knowledge you added to this assistant"}
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
                            : "You"}
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
                                    Sources
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
                                              Knowledge source
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

          <form
            action={
              sendPlaygroundMessage.bind(
                null,
                assistant.id,
              )
            }
            className={
              styles.playgroundComposer
            }
          >
            <label
              htmlFor="playground-question"
            >
              Ask a question
            </label>

            <textarea
              disabled={
                formDisabled
              }
              id="playground-question"
              maxLength={
                2000
              }
              name="question"
              placeholder={
                knowledgeReady
                  ? "Ask about your company knowledge…"
                  : "Process a knowledge source first"
              }
            />

            <div
              className={
                styles.playgroundComposerFooter
              }
            >
              <small>
                Answers are limited to your
                uploaded knowledge
              </small>

              <PlaygroundSubmitButton
                disabled={
                  formDisabled
                }
              />
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
              Ready sources
            </span>

            <strong>
              {readySourceCount}
            </strong>

            <p>
              Only sources marked Ready can be
              retrieved for answers
            </p>
          </div>

          <div
            className={
              styles.playgroundSideCard
            }
          >
            <span>
              Context
            </span>

            <strong>
              Last 8 messages
            </strong>

            <p>
              Conversation history helps with
              follow-up questions but is never
              treated as factual evidence
            </p>
          </div>

          <div
            className={
              styles.playgroundSideCard
            }
          >
            <span>
              Knowledge search
            </span>

            <strong>
              Best 5 matches
            </strong>

            <p>
              Anvera checks the most relevant
              passages before answering
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
