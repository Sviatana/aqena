# AQENA

AQENA is a production SaaS platform for building grounded AI knowledge assistants for businesses.

Businesses can create an assistant, add company knowledge, test answers in a private Playground, request Pro access and publish the assistant as an embeddable website chat widget.

AQENA uses retrieval-augmented generation (RAG). Company facts must be supported by retrieved knowledge. If the available sources do not support an answer, the assistant returns the configured fallback message instead of inventing information.

## Live application

Production: `https://aqena.ai24solutions.online`

Northstar Coffee demo: `https://aqena.ai24solutions.online/demo/northstar-coffee`

Repository: `Sviatana/aqena`

## Product flow

1. Sign up with email and password
2. Create an assistant
3. Configure name, description, instructions, welcome message, fallback message and business color
4. Add knowledge from PDF, TXT, Markdown or pasted text
5. Process knowledge into searchable vector chunks
6. Test grounded answers in the Playground
7. Review source references
8. Request Pro access for the appropriate pricing region
9. After payment confirmation, an authorized platform owner activates Pro
10. Publish the assistant
11. Copy the installation snippet
12. Use the assistant through the website widget

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth
- PostgreSQL
- pgvector
- private Supabase Storage
- OpenRouter for chat completions and embeddings
- OpenNext for Cloudflare
- Cloudflare Workers
- Vitest
- Playwright
- GitHub Actions

AQENA is a single Next.js application. There is no separate backend microservice.

## Architecture

```text
Browser
  |
  +-- Landing / Auth / Dashboard / Playground
  |
  +-- widget.js
        |
        +-- Shadow DOM launcher
        |
        +-- iframe /embed/[publicId]
                 |
                 +-- POST /api/public/assistants/[publicId]/messages
                          |
                          +-- server-side plan and publish checks
                          +-- vector retrieval
                          +-- grounded answer generation
                          +-- atomic conversation and usage commit
```

Knowledge flow:

```text
PDF / TXT / MD / manual text
  -> server-side text extraction
  -> normalization
  -> 700-1000 token chunks
  -> 120-token overlap target
  -> embeddings
  -> PostgreSQL + pgvector
  -> top-K similarity retrieval
  -> grounded answer
  -> citations or configured fallback
```

## Knowledge and RAG

Supported sources:

- PDF
- TXT
- Markdown
- manually pasted text

Uploaded files are limited to 5 MB. Text-based PDFs are extracted on the server. OCR for scanned PDFs is outside the MVP scope.

Chunking configuration:

```text
minimum: 700 estimated tokens
target: 900 estimated tokens
maximum: 1000 estimated tokens
overlap target: 120 tokens
accepted overlap range: 100-150 tokens
```

Default retrieval configuration:

```text
RAG_TOP_K=5
RAG_MIN_SIMILARITY=0.40
CHAT_HISTORY_MESSAGES=8
```

Only knowledge sources with `Ready` status are eligible for retrieval.

Conversation history is used as conversational context only. It is not treated as factual evidence.

The answer layer treats uploaded knowledge as untrusted reference data. Instructions found inside source documents are ignored. A factual claim is allowed only when retrieved knowledge supports it. If evidence is insufficient, the configured fallback is returned with no citations.

## Authentication

Authentication uses Supabase email and password.

Implemented flows:

- sign up
- email confirmation
- sign in
- password recovery
- password update
- protected dashboard routes

## Assistant configuration

Assistant owners can configure:

- name
- description
- instructions
- welcome message
- fallback message
- business color for the customer-facing website chat

The business color is applied to the website chat UI. It is not the AQENA platform brand color.

## Plans

### Free

- 1 assistant
- 3 knowledge sources
- 50 messages per month
- Playground
- basic customization
- AQENA branding
- no website embedding

### Pro

- up to 5 assistants
- up to 100 knowledge sources
- 2,000 messages per month
- website embedding
- removal of AQENA branding
- advanced customization

Pro access currently uses a regional manual-payment workflow. A customer submits a Pro request and, after payment is confirmed outside AQENA, an authorized platform owner activates the plan through the protected administration interface.

AQENA does not collect or store payment-card data. A legacy mock-billing path remains available only when both `BILLING_MODE=mock` and `ALLOW_MOCK_BILLING=true` are explicitly enabled. Production keeps mock activation disabled.

## Playground

The private Playground supports:

- grounded questions against ready knowledge
- citations for supported answers
- configured fallback for unsupported answers
- latest 8 messages as conversation context
- monthly usage counters
- clearing conversation history without resetting usage

Playground and website-widget messages both contribute to the monthly plan limit.

## Website widget

Published Pro assistants can be embedded with:

```html
<script
  src="https://YOUR_AQENA_DOMAIN/widget.js"
  data-assistant-id="PUBLIC_ASSISTANT_ID"
  async
></script>
```

The public assistant ID is an unpredictable UUID separate from the internal assistant database ID.

`widget.js` validates the public ID, creates a Shadow DOM host and opens the customer chat in an iframe at `/embed/[publicId]`.

Public questions are sent only to the server API:

```text
POST /api/public/assistants/[publicId]/messages
```

The browser never receives the Supabase server secret or the OpenRouter API key.

## Database and security

Supabase Row Level Security protects user-owned application data.

Knowledge documents are stored in a private Storage bucket and application access is performed server-side.

Security controls include:

- Row Level Security on user-owned tables
- private knowledge-document storage
- server-only Supabase and OpenRouter credentials
- unpredictable public assistant UUIDs
- published-state checks
- active-Pro checks for website embedding
- server-side plan and usage limits
- retrieval restricted to ready sources
- prompt-injection defense in the grounded answer layer
- fallback for unsupported answers
- atomic Playground message and usage updates
- atomic public-widget message and usage updates

Supabase migrations are stored in `supabase/migrations/`.

## Demo knowledge source

The repository includes the canonical Northstar Coffee demo knowledge file:

```text
docs/demo/northstar-coffee-knowledge.txt
```

It contains business information covering locations, menu and online store information, shipping, returns, pickup, subscriptions, catering, wholesale, privacy and support policies.

Useful demo questions:

```text
Do you offer free shipping on orders over $50?
Does free shipping apply to Alaska?
What is the wholesale minimum?
What is the Wi-Fi password?
```

The first three are supported by the demo knowledge. The Wi-Fi password is intentionally absent and should return the configured fallback instead of a fabricated answer.

## Environment variables

Copy `.env.example` to `.env.local` for local development.

Required variable names:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
OPENROUTER_API_KEY
PLATFORM_OWNER_EMAIL
LLM_MODEL
EMBEDDING_MODEL
EMBEDDING_DIMENSIONS
RAG_TOP_K
RAG_MIN_SIMILARITY
CHAT_HISTORY_MESSAGES
BILLING_MODE
ALLOW_MOCK_BILLING
PLATFORM_OWNER_EMAIL
```

Never commit `.env.local` or real credentials.

## Local development

CI uses Node.js 24.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Default local address:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm test
npm run test:e2e
npm run check
npm run build
npm run build:cloudflare
npm run preview
npm run deploy
```

`npm run check` runs ESLint and TypeScript type checking.

## Automated tests

The automated suite has three layers.

### Unit tests

Four Vitest files contain 8 unit tests covering:

- chunk sizing and overlap
- knowledge-plan limits
- file validation
- safe storage names
- RAG configuration
- grounded answer and fallback behavior

### Integration tests

`tests/widget-route.integration.test.ts` contains 4 integration tests for the real public widget API route with external boundaries mocked.

The integration suite verifies:

- invalid public assistant IDs are rejected before Supabase access
- empty questions are rejected before Supabase access
- website access is hidden for assistants whose owner is not on active Pro
- a published Pro assistant runs through retrieval, grounded answering and atomic commit orchestration

These tests do not write to Supabase and do not call OpenRouter.

### Browser E2E smoke

`tests/e2e/public-smoke.spec.ts` contains 3 Playwright tests using Chromium.

The browser smoke verifies:

- guest landing navigation to Sign in and Sign up
- Login and Sign-up form controls without submitting real credentials
- the Northstar demo loads the real `widget.js`, renders the launcher and opens/closes the iframe

The iframe network dependency is intercepted during the E2E test, so automated browser tests do not write to Supabase or call OpenRouter.

The automated suite continues to grow with the product. Run `npm test` and `npm run test:e2e` for the current test counts.

## Continuous integration

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

For pushes to `main` and pull requests, CI runs:

```text
npm ci
npm test
npm run check
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run build:cloudflare
```

CI uses placeholder service configuration for tests and builds. Production credentials are not stored in the workflow.

CI validates the application. Production deployment is handled separately through the configured Cloudflare deployment pipeline after changes reach `main`.

## Cloudflare

The application is packaged for Cloudflare Workers through OpenNext.

Relevant files:

- `open-next.config.ts`
- `wrangler.jsonc`

The Worker requires these server-side secrets in the production environment:

```text
SUPABASE_SECRET_KEY
OPENROUTER_API_KEY
```

`wrangler.jsonc` enables `nodejs_compat`, static asset binding and observability.

Production application:

`https://aqena.ai24solutions.online`

## Supabase migrations

The repository contains migrations for:

- base application schema
- private knowledge storage policies
- server-only knowledge storage access
- pgvector RAG foundation
- ready-source retrieval restriction
- Playground usage tracking
- atomic Playground exchange
- public widget server foundation
- atomic widget exchange
- assistant business color customization
- public widget rate limiting
- manual billing requests
- platform-owner manual Pro administration

Apply pending migrations to a linked Supabase project with the Supabase CLI before running the full application against a new database.

## MVP boundaries

The MVP intentionally does not include:

- direct card payment processing
- OCR for scanned PDFs
- multiple selectable LLM providers in the UI
- a separate backend microservice

The production demo uses real Supabase persistence and real RAG. Automated CI keeps external service boundaries isolated so it can run without production credentials or production database writes.
