# Anvera

Anvera is a SaaS MVP for creating grounded AI knowledge assistants for small businesses.

Businesses can create an assistant, add their own company knowledge, test answers in a private Playground and publish the assistant as a website chat widget.

Anvera uses retrieval-augmented generation. Company facts must be supported by retrieved knowledge. If the available sources do not support an answer, the assistant returns the configured fallback message instead of inventing information.

## Product flow

1. Sign up with email and password
2. Create an assistant
3. Configure name, description, instructions, welcome message and fallback message
4. Add knowledge from PDF, TXT, Markdown or pasted text
5. Process knowledge into searchable vector chunks
6. Test grounded answers in Playground
7. Review source references
8. Upgrade through the mock Pro checkout
9. Publish the assistant
10. Copy the installation snippet
11. Use the assistant through the website widget

Permanent demo: `/demo/northstar-coffee`

## Stack

- Next.js App Router, React and TypeScript
- Supabase Auth, PostgreSQL, pgvector and private Storage
- OpenRouter
- OpenNext and Cloudflare Workers
- Vitest
- GitHub Actions

## Architecture

Anvera is one Next.js application. Sensitive credentials remain server-side. There is no separate backend microservice.

Knowledge flow:

```text
document
  -> text extraction
  -> chunking
  -> embeddings
  -> PostgreSQL + pgvector
  -> similarity retrieval
  -> grounded answer
```

## Knowledge and RAG

Supported sources are PDF, TXT, Markdown and manually pasted text. Uploaded files are limited to 5 MB. Text-based PDFs are extracted on the server; OCR is outside the MVP scope.

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

Only knowledge sources with `Ready` status are eligible for retrieval. Conversation history is context only and is not treated as factual evidence.

Knowledge text is treated as untrusted reference data. The answer layer is instructed to ignore commands found inside uploaded knowledge, use retrieved company knowledge as factual evidence, avoid filling missing facts with outside knowledge, and return the configured fallback with no citations when evidence is insufficient.

## Authentication and assistant configuration

Authentication uses Supabase email and password. Implemented flows include sign up, sign in, password recovery, password update and protected dashboard routes.

Assistant owners can configure:

- name
- description
- instructions
- welcome message
- fallback message

## Plans

### Free

- 1 assistant
- 3 knowledge sources
- 50 messages per month
- Playground
- basic customization
- Anvera branding
- no website embedding

### Pro

Mock price: `$29 / month`

- up to 5 assistants
- up to 100 knowledge sources
- 2,000 messages per month
- website embedding
- removal of Anvera branding
- advanced customization

Billing uses `BILLING_MODE=mock`. No real card information is collected.

## Playground

The private Playground supports grounded questions against ready knowledge, source references for supported answers, the latest 8 messages as conversation context, monthly usage counters and clearing conversation history without resetting usage.

Playground and widget usage are tracked separately and also contribute to the total monthly limit.

## Website widget

Published Pro assistants can be embedded with:

```html
<script
  src="https://YOUR_ANVERA_DOMAIN/widget.js"
  data-assistant-id="PUBLIC_ASSISTANT_ID"
  async
></script>
```

The public assistant ID is an unpredictable UUID separate from the internal assistant database ID. The loader uses Shadow DOM and opens the chat inside an iframe. Public messages are handled through the server API. Supabase secret credentials and the OpenRouter API key are never exposed to the browser.

## Database and security

Supabase Row Level Security protects user-owned application data. Knowledge files are stored privately. Public widget requests do not receive direct table access.

Security measures include:

- private knowledge storage
- Row Level Security
- server-only Supabase and OpenRouter credentials
- unpredictable public assistant UUIDs
- published-state and Pro-plan checks
- server-side usage limits
- prompt-injection defense
- fallback for unsupported answers
- atomic message and usage updates

Supabase migrations are stored in `supabase/migrations/`.

## Local development

CI uses Node.js 24.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Default local address: `http://localhost:3000`

The committed `.env.example` documents the required application, Supabase, OpenRouter, RAG and billing variables. Never commit `.env.local` or real credentials.

## Scripts

```bash
npm run dev
npm test
npm run check
npm run build
npm run build:cloudflare
npm run preview
```

## Automated tests

The focused Vitest suite currently contains 4 test files and 8 tests covering chunking, overlap constraints, plan limits, file validation, safe storage names, RAG configuration and grounding/fallback behavior.

The unit tests do not call OpenRouter and do not write to Supabase.

## Continuous integration

GitHub Actions workflow: `.github/workflows/ci.yml`

For pushes to `main` and pull requests it runs:

```text
npm ci
npm test
npm run check
npm run build
npm run build:cloudflare
```

CI does not deploy and does not contain production credentials.

## Cloudflare

The application is packaged for Cloudflare through OpenNext. Relevant configuration files are `open-next.config.ts` and `wrangler.jsonc`.

Production application, Supabase and OpenRouter values must be configured in the Cloudflare environment before deployment.

## MVP boundaries

The MVP intentionally does not include real payment processing, OCR for scanned PDFs, multiple selectable LLM providers in the UI or a separate backend microservice.

## Repository

`Sviatana/paralect-chatbot-builder`
