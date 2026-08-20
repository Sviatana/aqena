import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";


const mocks =
  vi.hoisted(
    () => ({
      createAdminClient:
        vi.fn(),

      retrievePublicKnowledge:
        vi.fn(),

      answerFromKnowledge:
        vi.fn(),
    }),
  );


vi.mock(
  "@/lib/supabase/admin",
  () => ({
    createAdminClient:
      mocks.createAdminClient,
  }),
);


vi.mock(
  "@/lib/rag/retrieve",
  () => ({
    retrievePublicKnowledge:
      mocks.retrievePublicKnowledge,
  }),
);


vi.mock(
  "@/lib/rag/answer",
  () => ({
    answerFromKnowledge:
      mocks.answerFromKnowledge,
  }),
);


vi.mock(
  "@/lib/rag/config",
  () => ({
    ragConfig: () => ({
      topK: 5,
      minSimilarity: 0.4,
      historyMessages: 8,
    }),
  }),
);


import {
  POST,
} from "@/app/api/public/assistants/[publicId]/messages/route";


const PUBLIC_ID =
  "11111111-1111-4111-8111-111111111111";

const ASSISTANT_ID =
  "22222222-2222-4222-8222-222222222222";

const OWNER_ID =
  "33333333-3333-4333-8333-333333333333";

const CONVERSATION_ID =
  "44444444-4444-4444-8444-444444444444";


function maybeSingleQuery(
  result: {
    data: unknown;
    error: unknown;
  },
) {
  const query = {
    select:
      vi.fn(),

    eq:
      vi.fn(),

    maybeSingle:
      vi.fn(
        async () =>
          result,
      ),
  };

  query.select
    .mockReturnValue(
      query,
    );

  query.eq
    .mockReturnValue(
      query,
    );

  return query;
}


function historyQuery(
  result: {
    data: unknown;
    error: unknown;
  },
) {
  const query = {
    select:
      vi.fn(),

    eq:
      vi.fn(),

    in:
      vi.fn(),

    order:
      vi.fn(),

    limit:
      vi.fn(
        async () =>
          result,
      ),
  };

  query.select
    .mockReturnValue(
      query,
    );

  query.eq
    .mockReturnValue(
      query,
    );

  query.in
    .mockReturnValue(
      query,
    );

  query.order
    .mockReturnValue(
      query,
    );

  return query;
}


function conversationInsertQuery(
  result: {
    data: unknown;
    error: unknown;
  },
) {
  const single =
    vi.fn(
      async () =>
        result,
    );

  const selected = {
    single,
  };

  const inserted = {
    select:
      vi.fn(
        () =>
          selected,
      ),
  };

  return {
    insert:
      vi.fn(
        () =>
          inserted,
      ),
  };
}


type AdminScenario = {
  assistant: {
    data: unknown;
    error: unknown;
  };

  subscription?: {
    data: unknown;
    error: unknown;
  };

  usage?: {
    data: unknown;
    error: unknown;
  };

  history?: {
    data: unknown;
    error: unknown;
  };

  conversation?: {
    data: unknown;
    error: unknown;
  };

  commit?: {
    data: unknown;
    error: unknown;
  };
};


function buildAdmin(
  scenario: AdminScenario,
) {
  const assistantQuery =
    maybeSingleQuery(
      scenario.assistant,
    );

  const subscriptionQuery =
    maybeSingleQuery(
      scenario.subscription
      ?? {
        data: null,
        error: null,
      },
    );

  const usageQuery =
    maybeSingleQuery(
      scenario.usage
      ?? {
        data: null,
        error: null,
      },
    );

  const messagesQuery =
    historyQuery(
      scenario.history
      ?? {
        data: [],
        error: null,
      },
    );

  const conversationsQuery =
    conversationInsertQuery(
      scenario.conversation
      ?? {
        data: {
          id:
            CONVERSATION_ID,
        },
        error: null,
      },
    );

  const rpc =
    vi.fn(
      async () =>
        scenario.commit
        ?? {
          data: [
            {
              allowed:
                true,

              plan_name:
                "pro",
            },
          ],

          error:
            null,
        },
    );

  const from =
    vi.fn(
      (
        table: string,
      ) => {
        switch (table) {
          case "assistants":
            return assistantQuery;

          case "subscriptions":
            return subscriptionQuery;

          case "usage_monthly":
            return usageQuery;

          case "conversations":
            return conversationsQuery;

          case "messages":
            return messagesQuery;

          default:
            throw new Error(
              `Unexpected table in integration test: ${table}`,
            );
        }
      },
    );

  return {
    from,
    rpc,
  };
}


function widgetRequest(
  body: unknown,
) {
  return new Request(
    `http://localhost/api/public/assistants/${PUBLIC_ID}/messages`,
    {
      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          body,
        ),
    },
  );
}


function routeContext(
  publicId =
    PUBLIC_ID,
) {
  return {
    params:
      Promise.resolve({
        publicId,
      }),
  };
}


beforeEach(
  () => {
    mocks.createAdminClient
      .mockReset();

    mocks.retrievePublicKnowledge
      .mockReset();

    mocks.answerFromKnowledge
      .mockReset();
  },
);


describe(
  "public widget API integration",
  () => {
    it(
      "rejects an invalid public assistant id before touching Supabase",
      async () => {
        const response =
          await POST(
            widgetRequest({
              question:
                "Do you ship orders?",
            }),
            routeContext(
              "not-a-public-id",
            ),
          );

        const payload =
          await response.json() as {
            error?: string;
          };

        expect(
          response.status,
        ).toBe(404);

        expect(
          payload.error,
        ).toBe(
          "Assistant not found.",
        );

        expect(
          mocks.createAdminClient,
        ).not.toHaveBeenCalled();
      },
    );


    it(
      "rejects an empty question before touching Supabase",
      async () => {
        const response =
          await POST(
            widgetRequest({
              question:
                "   ",
            }),
            routeContext(),
          );

        const payload =
          await response.json() as {
            error?: string;
          };

        expect(
          response.status,
        ).toBe(400);

        expect(
          payload.error,
        ).toBe(
          "Ask a question first.",
        );

        expect(
          mocks.createAdminClient,
        ).not.toHaveBeenCalled();
      },
    );


    it(
      "hides a published assistant when its owner does not have active Pro",
      async () => {
        const admin =
          buildAdmin({
            assistant: {
              data: {
                id:
                  ASSISTANT_ID,

                owner_id:
                  OWNER_ID,

                name:
                  "Northstar Coffee Support",

                instructions:
                  "Answer from company knowledge.",

                fallback_message:
                  "I could not find that.",

                status:
                  "ready",

                is_published:
                  true,
              },

              error:
                null,
            },

            subscription: {
              data: {
                plan:
                  "free",

                status:
                  "active",
              },

              error:
                null,
            },
          });

        mocks.createAdminClient
          .mockReturnValue(
            admin,
          );

        const response =
          await POST(
            widgetRequest({
              question:
                "Do you ship orders?",
            }),
            routeContext(),
          );

        const payload =
          await response.json() as {
            error?: string;
          };

        expect(
          response.status,
        ).toBe(404);

        expect(
          payload.error,
        ).toBe(
          "Assistant not found.",
        );

        expect(
          mocks.retrievePublicKnowledge,
        ).not.toHaveBeenCalled();

        expect(
          mocks.answerFromKnowledge,
        ).not.toHaveBeenCalled();
      },
    );


    it(
      "runs the published Pro assistant through retrieval, grounded answering and atomic commit",
      async () => {
        const admin =
          buildAdmin({
            assistant: {
              data: {
                id:
                  ASSISTANT_ID,

                owner_id:
                  OWNER_ID,

                name:
                  "Northstar Coffee Support",

                instructions:
                  "Answer only from Northstar knowledge.",

                fallback_message:
                  "I couldn't find that in Northstar Coffee's available information.",

                status:
                  "ready",

                is_published:
                  true,
              },

              error:
                null,
            },

            subscription: {
              data: {
                plan:
                  "pro",

                status:
                  "active",
              },

              error:
                null,
            },

            usage: {
              data: {
                message_count:
                  12,
              },

              error:
                null,
            },

            history: {
              data: [
                {
                  role:
                    "assistant",

                  content:
                    "Earlier answer",

                  created_at:
                    "2026-08-20T10:01:00.000Z",
                },

                {
                  role:
                    "user",

                  content:
                    "Earlier question",

                  created_at:
                    "2026-08-20T10:00:00.000Z",
                },
              ],

              error:
                null,
            },

            conversation: {
              data: {
                id:
                  CONVERSATION_ID,
              },

              error:
                null,
            },

            commit: {
              data: [
                {
                  allowed:
                    true,

                  plan_name:
                    "pro",
                },
              ],

              error:
                null,
            },
          });

        mocks.createAdminClient
          .mockReturnValue(
            admin,
          );

        mocks.retrievePublicKnowledge
          .mockResolvedValue([
            {
              sourceId:
                "source-1",

              sourceTitle:
                "Shipping policy",

              chunkId:
                "chunk-1",

              content:
                "Free standard shipping is available on orders of $50 or more.",

              similarity:
                0.91,
            },
          ]);

        mocks.answerFromKnowledge
          .mockResolvedValue({
            answer:
              "Yes. Free standard shipping is available on orders of $50 or more.",

            insufficient:
              false,

            citations: [
              {
                sourceId:
                  "source-1",

                sourceTitle:
                  "Shipping policy",

                chunkId:
                  "chunk-1",

                similarity:
                  0.91,
              },
            ],

            inputTokens:
              18,

            outputTokens:
              12,
          });

        const question =
          "Do you offer free shipping on orders over $50?";

        const response =
          await POST(
            widgetRequest({
              question,
            }),
            routeContext(),
          );

        const payload =
          await response.json() as {
            conversationId?: string;
            answer?: string;
          };

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.headers.get(
            "cache-control",
          ),
        ).toBe(
          "no-store",
        );

        expect(
          payload,
        ).toEqual({
          conversationId:
            CONVERSATION_ID,

          answer:
            "Yes. Free standard shipping is available on orders of $50 or more.",
        });

        expect(
          mocks.retrievePublicKnowledge,
        ).toHaveBeenCalledWith(
          admin,
          PUBLIC_ID,
          question,
        );

        expect(
          mocks.answerFromKnowledge,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            question,

            history: [
              {
                role:
                  "user",

                content:
                  "Earlier question",
              },

              {
                role:
                  "assistant",

                content:
                  "Earlier answer",
              },
            ],

            assistantInstructions:
              "Answer only from Northstar knowledge.",

            fallbackMessage:
              "I couldn't find that in Northstar Coffee's available information.",
          }),
        );

        expect(
          admin.rpc,
        ).toHaveBeenCalledWith(
          "commit_widget_exchange",
          expect.objectContaining({
            p_public_id:
              PUBLIC_ID,

            p_conversation_id:
              CONVERSATION_ID,

            p_user_content:
              question,

            p_assistant_content:
              "Yes. Free standard shipping is available on orders of $50 or more.",

            p_input_tokens:
              18,

            p_output_tokens:
              12,
          }),
        );
      },
    );
  },
);
