import {
  defineConfig,
  devices,
} from "@playwright/test";


const port =
  Number(
    process.env.E2E_PORT
    ?? "3107",
  );


const baseURL =
  process.env.E2E_BASE_URL
  ?? `http://127.0.0.1:${port}`;


export default defineConfig({
  testDir:
    "./tests/e2e",

  fullyParallel:
    false,

  forbidOnly:
    Boolean(
      process.env.CI,
    ),

  retries:
    process.env.CI
      ? 1
      : 0,

  workers:
    1,

  reporter:
    "line",

  use: {
    baseURL,

    trace:
      "retain-on-failure",

    screenshot:
      "only-on-failure",
  },

  projects: [
    {
      name:
        "chromium",

      use: {
        ...devices[
          "Desktop Chrome"
        ],
      },
    },
  ],

  webServer: {
    command:
      `npm run dev -- --hostname 127.0.0.1 --port ${port}`,

    url:
      baseURL,

    reuseExistingServer:
      false,

    timeout:
      120_000,

    env: {
      NEXT_PUBLIC_APP_URL:
        baseURL,

      NEXT_PUBLIC_SITE_URL:
        baseURL,

      NEXT_PUBLIC_SUPABASE_URL:
        "https://example.supabase.co",

      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_e2e_placeholder",

      SUPABASE_SECRET_KEY:
        "e2e_service_role_placeholder",

      OPENROUTER_API_KEY:
        "e2e_openrouter_placeholder",

      LLM_MODEL:
        "qwen/qwen3-30b-a3b-instruct-2507",

      EMBEDDING_MODEL:
        "qwen/qwen3-embedding-8b",

      EMBEDDING_DIMENSIONS:
        "1536",

      RAG_TOP_K:
        "5",

      RAG_MIN_SIMILARITY:
        "0.40",

      CHAT_HISTORY_MESSAGES:
        "8",

      BILLING_MODE:
        "mock",
    },
  },
});
