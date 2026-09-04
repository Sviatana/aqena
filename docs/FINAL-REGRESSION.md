# Anvera final regression report

## Release snapshot

- Product: Anvera
- Repository: `Sviatana/anvera`
- Production: `https://anvera.ai24solutions.online`
- Northstar Coffee demo: `https://anvera.ai24solutions.online/demo/northstar-coffee`
- Release commit: `207f873ba13e50714bedef012ab665c981a09b8d`
- Latest successful CI run: `32365964793`
- CI result: `success`
- CI job: `Test and build`
- Runtime target: Cloudflare Workers through OpenNext
- Database and auth: Supabase
- Billing mode: `mock`

This report records the final regression status of the submitted SaaS MVP. It separates automated verification, manual production verification and intentional MVP boundaries.

## Requirement coverage

| Requirement | Status | Implementation | Verification |
| --- | --- | --- | --- |
| Focused SaaS product for company knowledge assistants | PASS | Single-purpose Anvera application for building grounded knowledge assistants | Product flow and production application reviewed |
| Descriptive landing page | PASS | Hero, product value, workflow, features, pricing, FAQ and CTA | Production landing returns HTTP 200 and browser smoke covers guest navigation |
| Email and password authentication | PASS | Supabase Auth with sign up, confirmation, sign in, recovery and password update | Production authentication flow manually verified; auth pages covered by browser smoke |
| Protected dashboard | PASS | Authenticated dashboard and assistant routes | Route protection implemented through server-side auth checks |
| Assistant creation | PASS | Name, description, instructions, welcome message, fallback message and business color | Production flow manually verified |
| Company knowledge upload | PASS | PDF, TXT, Markdown and manual text | Upload and validation logic implemented; knowledge tests cover validation and limits |
| Knowledge processing states | PASS | Processing, Ready and Failed states with retry handling | Production knowledge flow manually verified |
| Real RAG pipeline | PASS | Extraction, normalization, chunking, embeddings, pgvector retrieval and grounded generation | Unit tests plus manual Northstar production queries |
| Chunking target | PASS | 700 minimum, 900 target, 1000 maximum, 120-token overlap target | `tests/chunk.test.ts` |
| Similarity retrieval | PASS | Top K 5 and default similarity threshold 0.40 | `tests/rag-config.test.ts` and production Northstar retrieval |
| Retrieval restricted to ready sources | PASS | Database retrieval RPCs filter to Ready knowledge | Migration and production behavior reviewed |
| Grounded answers only | PASS | Answer engine requires source support and rejects unsupported claims | `tests/rag-answer.test.ts` and production known/unknown question checks |
| Source references | PASS | Supported answers return citations mapped to retrieved chunks | Production Northstar known-answer check and API integration path |
| Fallback behavior | PASS | Configured fallback returned with no citations when evidence is insufficient | Unit test plus production Wi-Fi question |
| Conversation context bounded | PASS | Latest 8 messages | `CHAT_HISTORY_MESSAGES=8` configuration |
| Private Playground | PASS | Grounded chat, citations, usage count and clear-history flow | Production flow manually verified |
| Free plan | PASS | 1 assistant, 3 sources, 50 messages/month, Playground, basic customization, branding, no embed | Server-side checks and plan-limit tests |
| Pro plan | PASS | Up to 5 assistants, 100 sources, 2000 messages/month, embed, branding removal, advanced customization | Server-side checks and production mock-upgrade flow |
| Website embed gated to Pro | PASS | Free users are redirected to upgrade; active Pro is required by publish, embed page and public API | Integration tests and manual production upgrade/install flow |
| Mock billing | PASS | `$29/month` demo checkout, no card collection, persisted Pro subscription state | Production flow manually verified |
| Publish flow | PASS | Ready assistant plus active Pro required before website publishing | Server-side publish checks |
| Installation snippet | PASS | `widget.js` with `data-assistant-id` public UUID | Install page and README documented |
| Public assistant identifier | PASS | Unpredictable UUID separate from internal assistant ID | Widget loader and server routes validate public UUID |
| Working embeddable widget | PASS | Real JS loader, Shadow DOM launcher and iframe `/embed/[publicId]` | Playwright browser E2E plus production demo route |
| External demo website | PASS | Northstar Coffee demo page uses the same widget loader | Production `/demo/northstar-coffee` returns HTTP 200 |
| Demo knowledge source | PASS | Canonical Northstar document committed at `docs/demo/northstar-coffee-knowledge.txt` | SHA-256 verified before commit |
| Business color customization | PASS | Six-digit assistant brand color applied to customer-facing widget | Production customization manually verified |
| Server-side plan limits | PASS | Assistant, source, message and embed limits are enforced on the server | Unit/integration tests and source audit |
| Prompt injection defense | PASS | Retrieved documents are treated as untrusted data, not instructions | Grounded-answer system prompt reviewed |
| Private knowledge storage | PASS | Private Supabase Storage with server-only access | Storage migrations reviewed |
| Row Level Security | PASS | RLS enabled on user-owned application tables | Supabase migrations reviewed |
| Server-only secrets | PASS | Supabase secret and OpenRouter key are not exposed to the browser | Architecture and environment audit |
| Atomic message and usage updates | PASS | Playground and widget exchanges commit through database RPCs | Integration test covers widget commit orchestration |
| Responsive and usable product UI | PASS | Landing, auth, dashboard, Playground and widget implemented with responsive layouts | Manual visual QA completed during implementation; browser smoke confirms critical public interaction |
| Basic accessibility | PASS | Form labels, semantic controls, focus handling and widget accessibility attributes | Auth/browser E2E verifies labelled controls; widget launcher is exercised in Chromium |
| README | PASS | Architecture, setup, env names, RAG, security, billing, tests, deployment and demo documented | Final README committed in release `207f873` |
| Automated testing | PASS | Unit, integration and Chromium browser smoke | Latest CI run `32365964793` succeeded |
| CI | PASS | GitHub Actions runs tests, quality checks, Next build, Playwright and Cloudflare build | Latest CI run succeeded |
| Production deployment | PASS | Cloudflare Workers deployment is live | Production smoke returns HTTP 200 for landing, login, sign-up, demo and `widget.js` |
| Real payment processing | NOT REQUIRED | Mock billing intentionally used | Documented MVP boundary |
| OCR for scanned PDFs | OUT OF SCOPE | Text-based PDFs only | Documented MVP boundary |
| Multiple selectable LLM providers | OUT OF SCOPE | One configured provider through OpenRouter | Documented MVP boundary |
| Separate backend service | NOT USED | Server logic stays inside the Next.js application | Intentional architecture decision |

## Automated verification

### Vitest unit tests

Four unit-test files contain 8 tests:

- `tests/chunk.test.ts`
- `tests/knowledge.test.ts`
- `tests/rag-answer.test.ts`
- `tests/rag-config.test.ts`

Coverage includes chunk sizing and overlap, plan/source limits, upload validation, safe storage names, RAG defaults and grounded answer/fallback behavior.

### Vitest integration tests

`tests/widget-route.integration.test.ts` contains 4 route integration tests.

Verified behavior:

- invalid public assistant IDs are rejected before Supabase access
- empty questions are rejected before Supabase access
- website access is hidden when the assistant owner is not on active Pro
- a published active Pro assistant reaches retrieval, grounded answering and atomic widget commit orchestration

External boundaries are mocked. These tests do not write to Supabase and do not call OpenRouter.

### Playwright browser E2E

`tests/e2e/public-smoke.spec.ts` contains 3 Chromium tests.

Verified behavior:

- guest landing navigation reaches Sign in and Sign up
- Login and Sign-up controls render without submitting production credentials
- the Northstar demo loads the real `widget.js`, renders the launcher and opens and closes the iframe

The embed network dependency is intercepted in automated E2E so CI does not access production Supabase or OpenRouter.

### Current automated count

```text
Vitest: 5 files / 12 tests
Playwright: 3 browser tests
Total automated test cases: 15
```

## Continuous integration result

Latest verified workflow:

```text
Run ID: 32365964793
Commit: 207f873ba13e50714bedef012ab665c981a09b8d
Status: completed
Conclusion: success
```

The successful job ran:

```text
npm ci
npm test
npm run check
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run build:cloudflare
```

Production credentials are not stored in the CI workflow. Placeholder service configuration is used for test and build isolation.

## Manual production regression

### Public routes

Verified after the final README release:

```text
LANDING HTTP=200
LOGIN HTTP=200
SIGNUP HTTP=200
NORTHSTAR_DEMO HTTP=200
WIDGET_JS HTTP=200
```

### Authentication

Verified in production:

- email/password sign-up
- confirmation email delivery
- confirmation callback
- sign-in
- protected dashboard access

Password recovery and update routes are implemented and documented.

### Northstar grounded answer

Known question used during production verification:

```text
Do you offer free shipping on orders over $50?
```

Expected behavior:

- answer is supported by Northstar knowledge
- free standard shipping applies to orders of $50 or more
- the promotion applies within the contiguous United States
- source references are shown

This behavior was manually verified in production.

### Northstar exception retrieval

Useful follow-up:

```text
Does free shipping apply to Alaska?
```

Expected behavior:

- answer is grounded in the shipping-policy exception
- Alaska does not qualify for the standard free-shipping promotion

The canonical knowledge document contains this rule.

### Northstar fallback

Unsupported question used during production verification:

```text
What is the Wi-Fi password?
```

Expected behavior:

- no Wi-Fi password is invented
- configured fallback is returned
- no unsupported citation is attached

This behavior was manually verified in production.

### Mock Pro upgrade

Verified production flow:

```text
Free
→ Install
→ Pro gate
→ $29/month demo checkout
→ no real payment
→ Complete mock upgrade
→ persisted active Pro
→ Install unlocked
```

The checkout does not request, collect or store card details.

### Widget

Verified behavior:

- public assistant uses a separate UUID
- published active Pro is required
- `widget.js` creates a floating launcher
- widget opens in an iframe
- customer-facing brand color is applied
- public questions go through the server API
- production demo route remains healthy

## Security regression

| Control | Status | Evidence |
| --- | --- | --- |
| RLS on user-owned tables | PASS | Supabase migrations |
| Private knowledge storage | PASS | Storage bucket policy migrations |
| Server-only Supabase secret | PASS | Server architecture and env separation |
| Server-only OpenRouter key | PASS | Browser receives no provider key |
| Public UUID validation | PASS | Widget loader, embed page and API route |
| No client-supplied user ID for widget | PASS | Assistant resolved by public ID |
| Published-state check | PASS | Embed and public message route |
| Active-Pro check | PASS | Embed and public message route |
| Server-side usage limit | PASS | Public route and atomic commit RPC |
| Retrieval limited to Ready sources | PASS | Retrieval migration/RPC |
| Prompt-injection defense | PASS | Grounded-answer system prompt |
| Unsupported-answer fallback | PASS | Unit and production verification |
| Atomic Playground exchange | PASS | `commit_playground_exchange` |
| Atomic widget exchange | PASS | `commit_widget_exchange` |
| Secrets excluded from repository | PASS | staged secret scans and `.env.local` ignored |
| CI isolated from production services | PASS | placeholder environment and mocked boundaries |

## Northstar demo knowledge

Canonical file:

```text
docs/demo/northstar-coffee-knowledge.txt
```

Verified size at release:

```text
810 lines
21,985 bytes
SHA-256 2321cdceee76f70d5abcccbdb40c4e79f9cceb80c6bb8ce2bbe0d7e225e23cb5
```

The document covers café locations, menu and online store information, shipping, returns, local pickup, subscriptions, catering, wholesale, privacy and customer-support policies.

The landing-page Northstar shipping example was aligned with the canonical policy before release:

```text
Free standard shipping on orders of $50 or more within the contiguous United States
```

## Release history relevant to final verification

```text
207f873 docs: finalize Anvera project documentation
163d2f4 docs: add Northstar demo knowledge source
fee0023 test: add integration and browser e2e coverage
db19bfe feat: finalize Anvera customization and branding
7e5cfd5 feat: complete Anvera SaaS MVP
3ba3f12 feat: add Supabase data foundation
```

## Known MVP boundaries

The following are intentional boundaries rather than failed requirements:

- billing is mock only; no real payment is processed
- scanned-PDF OCR is not implemented
- the UI does not expose multiple selectable LLM providers
- there is no separate backend microservice
- automated browser E2E isolates external service boundaries rather than writing to the production database

The production demo itself uses real Supabase persistence and the real RAG pipeline.

## Final submission status

Anvera is ready for final demonstration as a functioning SaaS MVP.

Core acceptance path:

```text
Landing
→ Sign up / Sign in
→ Dashboard
→ Create assistant
→ Add knowledge
→ Process to Ready
→ Playground
→ Grounded answer + sources
→ Unsupported question + fallback
→ Install on Free
→ Pro gate
→ Mock upgrade
→ Publish
→ Install snippet
→ Northstar external demo
→ Working website widget
```

Final evidence package:

- live production application
- live external-style Northstar demo
- committed canonical demo knowledge source
- project README
- this regression report
- passing GitHub CI
- unit, integration and browser E2E coverage

The remaining submission task is the 3–5 minute video demonstration and voiceover using the verified flow above.
