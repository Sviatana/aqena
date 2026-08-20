"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./widget.module.css";

type WidgetChatProps = {
  assistantName: string;
  publicId: string;
  welcomeMessage: string;
};

type ChatMessage = {
  id: string;
  role:
    | "user"
    | "assistant";
  content: string;
};

type ApiResponse = {
  conversationId?: string;
  answer?: string;
  error?: string;
};

function messageId() {
  return (
    `${Date.now()}-`
    + Math.random()
      .toString(36)
      .slice(2)
  );
}

export default function WidgetChat({
  assistantName,
  publicId,
  welcomeMessage,
}: WidgetChatProps) {
  const [
    question,
    setQuestion,
  ] =
    useState("");

  const [
    pending,
    setPending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const conversationIdRef =
    useRef<string>("");

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>([
      {
        id:
          "welcome",
        role:
          "assistant",
        content:
          welcomeMessage,
      },
    ]);

  const scrollRef =
    useRef<HTMLDivElement>(
      null,
    );

  const storageKey =
    `anvera:widget:${publicId}`;

  useEffect(
    () => {
      try {
        const stored =
          window.sessionStorage
            .getItem(
              storageKey,
            );

        if (stored) {
          conversationIdRef.current =
            stored;
        }
      } catch {
        // Session storage is optional.
      }
    },
    [
      storageKey,
    ],
  );

  useEffect(
    () => {
      scrollRef.current
        ?.scrollTo({
          top:
            scrollRef.current
              .scrollHeight,
          behavior:
            "smooth",
        });
    },
    [
      messages,
      pending,
    ],
  );

  async function submitQuestion() {
    const value =
      question.trim();

    if (
      !value
      || pending
    ) {
      return;
    }

    if (
      value.length
      > 2_000
    ) {
      setError(
        "Questions can be up to 2,000 characters.",
      );

      return;
    }

    setError("");
    setQuestion("");
    setPending(true);

    const userMessage:
      ChatMessage = {
        id:
          messageId(),
        role:
          "user",
        content:
          value,
      };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ],
    );

    try {
      const response =
        await fetch(
          `/api/public/assistants/${publicId}/messages`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question:
                  value,

                conversationId:
                  conversationIdRef.current
                  || undefined,
              }),
          },
        );

      const payload =
        await response
          .json() as ApiResponse;

      if (
        !response.ok
        || !payload.answer
        || !payload.conversationId
      ) {
        throw new Error(
          payload.error
          || "The assistant could not answer. Please try again.",
        );
      }

      conversationIdRef.current =
        payload.conversationId;

      try {
        window.sessionStorage
          .setItem(
            storageKey,
            payload.conversationId,
          );
      } catch {
        // Session storage is optional.
      }

      setMessages(
        (current) => [
          ...current,
          {
            id:
              messageId(),
            role:
              "assistant",
            content:
              payload.answer
              ?? "",
          },
        ],
      );
    } catch (requestError) {
      setError(
        requestError
        instanceof Error
          ? requestError.message
          : "The assistant could not answer. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  function onSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void submitQuestion();
  }

  function onKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter"
      && !event.shiftKey
    ) {
      event.preventDefault();

      void submitQuestion();
    }
  }

  function closeWidget() {
    if (
      window.parent
      !== window
    ) {
      window.parent.postMessage(
        {
          type:
            "anvera:close",
        },
        "*",
      );
    }
  }

  return (
    <section
      className={
        styles.widget
      }
      aria-label={
        `${assistantName} chat`
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.identity
          }
        >
          <div
            className={
              styles.avatar
            }
            aria-hidden="true"
          >
            {assistantName
              .slice(
                0,
                1,
              )
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {assistantName}
            </strong>

            <span>
              Ask about our company
            </span>
          </div>
        </div>

        <button
          aria-label="Close chat"
          className={
            styles.closeButton
          }
          onClick={
            closeWidget
          }
          type="button"
        >
          ×
        </button>
      </header>

      <div
        className={
          styles.messages
        }
        ref={
          scrollRef
        }
      >
        {messages.map(
          (message) => (
            <div
              className={
                message.role
                === "user"
                  ? styles.userRow
                  : styles.assistantRow
              }
              key={
                message.id
              }
            >
              <div
                className={
                  message.role
                  === "user"
                    ? styles.userBubble
                    : styles.assistantBubble
                }
              >
                <p>
                  {message.content}
                </p>

              </div>
            </div>
          ),
        )}

        {pending ? (
          <div
            className={
              styles.assistantRow
            }
          >
            <div
              className={
                `${styles.assistantBubble} ${styles.thinking}`
              }
              aria-label="Assistant is thinking"
            >
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      <footer
        className={
          styles.composer
        }
      >
        {error ? (
          <div
            className={
              styles.error
            }
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form
          className={
            styles.form
          }
          onSubmit={
            onSubmit
          }
        >
          <textarea
            aria-label="Ask a question"
            disabled={
              pending
            }
            maxLength={
              2_000
            }
            onChange={
              (event) =>
                setQuestion(
                  event.target
                    .value,
                )
            }
            onKeyDown={
              onKeyDown
            }
            placeholder="Ask a question"
            rows={
              1
            }
            value={
              question
            }
          />

          <button
            aria-label="Send message"
            disabled={
              pending
              || !question.trim()
            }
            type="submit"
          >
            ↑
          </button>
        </form>

        <div
          className={
            styles.footerNote
          }
        >
          Answers are based on the company knowledge provided
        </div>
      </footer>
    </section>
  );
}
