import Link from "next/link";
import { AnveraLogo, AnveraMark } from "@/components/anvera-brand";
import { createClient } from "@/lib/supabase/server";
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="m5 10.3 3.1 3.1L15 6.6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M4 10h11m-4-4 4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M7 3.75h6.8L18 8v12.25H7V3.75Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M13.5 4v4.5H18"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 5.5h14v10H10l-5 4v-14Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m9 7-5 5 5 5M15 7l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export default async function Home() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const isAuthenticated =
    Boolean(
      claimsData?.claims?.sub,
    );

  const primaryHref =
    isAuthenticated
      ? "/dashboard"
      : "/auth/sign-up";

  const primaryLabel =
    isAuthenticated
      ? "Open dashboard"
      : "Build your assistant";

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <Link
            className="brand"
            href="/"
            aria-label="Anvera home"
          >
            <AnveraLogo
              priority
              width={108}
            />
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="header-actions">
            <a
              className="text-link demo-link"
              href="#product-preview"
            >
              See demo
            </a>

            <a
              className="text-link auth-link"
              href={
                isAuthenticated
                  ? "/dashboard"
                  : "/auth/login"
              }
            >
              {isAuthenticated
                ? "Dashboard"
                : "Sign in"}
            </a>

            <a
              className="button button-small"
              href={primaryHref}
            >
              {primaryLabel}
            </a>
          </div>
        </div>
      </header>

      <section className="hero anvera-hero-final-scope">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Built on your business knowledge
            </div>

            <h1 className="anvera-hero-title-final">Turn company knowledge into reliable customer answers</h1>

            <p className="hero-lead">
              Add your company docs, test real questions and put a helpful assistant on your website in minutes
            </p>

            <div className="hero-actions">
              <a
                className="button button-primary"
                href={primaryHref}
              >
                {primaryLabel}
                <ArrowIcon />
              </a>

              <a className="button button-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>

            <div className="trust-row">
              <span>
                <CheckIcon />
                Answers from your business knowledge
              </span>
              <span>
                <CheckIcon />
                Sources shown with every answer
              </span>
              <span>
                <CheckIcon />
                No credit card to start
              </span>
            </div>
          </div>

          <div className="hero-product" aria-label="Anvera product preview">
            <div className="product-window">
              <div className="window-topbar">
                <div className="window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="window-title">Northstar Coffee Assistant</span>
                <span className="status-pill">
                  <span />
                  Ready
                </span>
              </div>

              <div className="assistant-shell">
                <aside className="assistant-sidebar">
                  <div className="sidebar-brand">
                    <AnveraMark
                      className="mini-mark-image"
                      size={22}
                    />
                    <strong>Anvera</strong>
                  </div>

                  <div className="sidebar-label">Workspace</div>
                  <div className="sidebar-item active">
                    <ChatIcon />
                    Playground
                  </div>
                  <div className="sidebar-item">
                    <FileIcon />
                    Knowledge
                  </div>
                  <div className="sidebar-item">
                    <CodeIcon />
                    Install
                  </div>
                </aside>

                <div className="chat-preview">
                  <div className="chat-heading">
                    <div>
                      <span className="chat-label">PLAYGROUND</span>
                      <h2>Test your assistant</h2>
                    </div>
                    <span className="model-status">3 sources ready</span>
                  </div>

                  <div className="chat-messages">
                    <div className="message user-message">
                      Do you offer free delivery?
                    </div>

                    <div className="message assistant-message">
                      <div className="assistant-avatar">N</div>
                      <div>
                        <p>
                          Yes. Northstar Coffee offers free standard shipping on
                          orders of $50 or more within the contiguous United States.
                        </p>

                        <div className="source-card">
                          <FileIcon />
                          <div>
                            <strong>Delivery Policy.pdf</strong>
                            <span>Page 2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="message user-message short">
                      Can I return opened coffee?
                    </div>

                    <div className="typing-row">
                      <div className="assistant-avatar">N</div>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="chat-input">
                    <span>Ask a question about your company</span>
                    <button type="button" aria-label="Send message">
                      <ArrowIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card source-floating-card">
              <span className="floating-icon">
                <FileIcon />
              </span>
              <div>
                <strong>3 sources ready</strong>
                <span>Knowledge is ready</span>
              </div>
              <span className="success-dot">✓</span>
            </div>

            <div className="floating-card widget-floating-card">
              <span className="floating-icon dark">
                <CodeIcon />
              </span>
              <div>
                <strong>Website chat</strong>
                <span>Quick website setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section">
        <div className="container narrow-container">
          <div className="section-heading centered">
            <span className="section-kicker">THE PROBLEM</span>
            <h2>Company knowledge gets harder to use as you grow</h2>
            <p>
              Important answers end up across documents, folders and old conversations while customers keep asking the same questions
            </p>
          </div>

          <div className="problem-grid">
            <article>
              <span className="problem-number">01</span>
              <h3>Finding the right answer takes time</h3>
              <p>
                Your team searches through files and conversations before it can answer with confidence
              </p>
            </article>

            <article>
              <span className="problem-number">02</span>
              <h3>Answers become inconsistent</h3>
              <p>
                Different people give different answers when the right company information is difficult to find
              </p>
            </article>

            <article>
              <span className="problem-number">03</span>
              <h3>An assistant should know when to stop</h3>
              <p>
                If your company knowledge does not contain the answer, Anvera should say so instead of guessing
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">HOW IT WORKS</span>
            <h2>Build a reliable assistant in three simple steps</h2>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-top">
                <span className="step-number">01</span>
                <span className="feature-icon">
                  <FileIcon />
                </span>
              </div>
              <h3>Add your knowledge</h3>
              <p>
                Upload the guides, policies and FAQs your team already relies on
              </p>
              <div className="mini-ui files-mini-ui">
                <span>
                  <FileIcon />
                  Delivery Policy.pdf
                  <b>Ready</b>
                </span>
                <span>
                  <FileIcon />
                  Product FAQ
                  <b>Ready</b>
                </span>
              </div>
            </article>

            <article className="step-card">
              <div className="step-top">
                <span className="step-number">02</span>
                <span className="feature-icon">
                  <ChatIcon />
                </span>
              </div>
              <h3>Test real questions</h3>
              <p>
                Ask the questions customers actually send you and review every answer
              </p>
              <div className="mini-ui question-mini-ui">
                <span>What is your return window?</span>
                <div>
                  <i>A</i>
                  <p>Returns are accepted within 30 days</p>
                </div>
              </div>
            </article>

            <article className="step-card">
              <div className="step-top">
                <span className="step-number">03</span>
                <span className="feature-icon">
                  <CodeIcon />
                </span>
              </div>
              <h3>Add it to your website</h3>
              <p>
                When you are ready, add the assistant to your site with a simple website chat
              </p>
              <div className="mini-ui code-mini-ui">
                <strong className="install-ready">Website assistant ready</strong>
                <span>Copy code</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container trust-layout">
          <div className="trust-heading">
            <div className="trust-heading-main">
              <p className="section-kicker">BUILT FOR TRUST</p>

              <h2>
                Answers you can verify before customers rely on them
              </h2>
            </div>

            <p className="trust-heading-copy">
              Anvera starts with your company knowledge and keeps the source
              behind every answer easy to check.
            </p>
          </div>

          <div className="trust-board">
            <article className="trust-item">
              <span className="trust-number">01</span>

              <div>
                <h3>Company knowledge first</h3>

                <p>
                  Answers come from the guides, policies and FAQs you provide.
                  If the information is missing, Anvera says so.
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">✓</span>
                Your knowledge
              </span>
            </article>

            <article className="trust-item">
              <span className="trust-number">02</span>

              <div>
                <h3>Every source stays visible</h3>

                <p>
                  See which company document supported an answer and check the
                  information whenever you need to.
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">✓</span>
                Source included
              </span>
            </article>

            <article className="trust-item">
              <span className="trust-number">03</span>

              <div>
                <h3>Test before customers use it</h3>

                <p>
                  Ask real questions first, review the answers and catch gaps
                  in your company knowledge before launch.
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">✓</span>
                Review first
              </span>
            </article>

            <article className="trust-item trust-item-accent">
              <span className="trust-number">04</span>

              <div>
                <h3>Move to your website when ready</h3>

                <p>
                  Once the answers look right, give customers the same helpful
                  experience directly on your website.
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">✓</span>
                Website chat
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="preview-section" id="product-preview">
        <div className="container">
          <div className="preview-panel">
            <div className="preview-copy">
              <span className="section-kicker light-kicker">PLAYGROUND</span>
              <h2>Review answers before customers see them</h2>
              <p>
                Test customer questions, check the sources and spot missing information before customers see the assistant
              </p>

              <ul className="preview-list">
                <li>
                  <CheckIcon />
                  Clear feedback while answers are prepared
                </li>
                <li>
                  <CheckIcon />
                  Sources shown with every answer
                </li>
                <li>
                  <CheckIcon />
                  Clear response when information is missing
                </li>
              </ul>
            </div>

            <div className="preview-chat">
              <div className="preview-chat-top">
                <div>
                  <span className="preview-avatar">N</span>
                  <div>
                    <strong>Northstar Coffee</strong>
                    <small>AI support assistant</small>
                  </div>
                </div>
                <span className="online-status">Online</span>
              </div>

              <div className="preview-chat-body">
                <div className="preview-bubble assistant-bubble">
                  Hi — ask me anything about Northstar Coffee products,
                  delivery or returns
                </div>
                <div className="preview-bubble customer-bubble">
                  How quickly do you ship orders?
                </div>
                <div className="preview-bubble assistant-bubble">
                  Orders placed before 2 PM ET usually ship the same business
                  day
                  <div className="inline-source">
                    <FileIcon />
                    Shipping FAQ
                  </div>
                </div>
              </div>

              <div className="preview-chat-input">
                <span>Ask a question</span>
                <i>
                  <ArrowIcon />
                </i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container pricing-container">
          <div className="section-heading centered">
            <span className="section-kicker">PRICING</span>
            <h2>Start free, add it to your website when you are ready</h2>
            <p>
              Build and test your first assistant for free. Upgrade when you want website chat and higher limits
            </p>
          </div>

          <div className="pricing-grid">
            <article className="pricing-card">
              <div className="plan-heading">
                <h3>Free</h3>
                <p>For building and testing your first assistant</p>
              </div>

              <div className="price">
                <strong>$0</strong>
                <span>forever</span>
              </div>

              <a className="button button-plan-secondary" href={primaryHref}>
                Start with Free
              </a>

              <ul>
                <li>
                  <CheckIcon />1 assistant
                </li>
                <li>
                  <CheckIcon />3 knowledge sources
                </li>
                <li>
                  <CheckIcon />50 messages / month
                </li>
                <li>
                  <CheckIcon />
                  Playground
                </li>
                <li>
                  <CheckIcon />
                  Basic customization
                </li>
                <li>
                  <CheckIcon />
                  Anvera branding
                </li>
              </ul>

              <div className="plan-limit">Website chat not included</div>
            </article>

            <article className="pricing-card pricing-card-pro">
              <div className="popular-badge">Best for websites</div>

              <div className="plan-heading">
                <h3>Pro</h3>
                <p>For assistants ready to support real customers</p>
              </div>

              <div className="price">
                <strong>$29</strong>
                <span>/ month</span>
              </div>

              <a className="button button-plan-primary" href={primaryHref}>
                Choose Pro
              </a>

              <ul>
                <li>
                  <CheckIcon />
                  Up to 5 assistants
                </li>
                <li>
                  <CheckIcon />
                  100 knowledge sources
                </li>
                <li>
                  <CheckIcon />
                  2,000 messages / month
                </li>
                <li>
                  <CheckIcon />
                  Add to your website
                </li>
                <li>
                  <CheckIcon />
                  Remove Anvera branding
                </li>
                <li>
                  <CheckIcon />
                  Advanced customization
                </li>
              </ul>

              <div className="plan-note">Website chat included</div>
            </article>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container faq-grid">
          <div className="faq-heading">
            <span className="section-kicker">FAQ</span>
            <h2>Questions before you build</h2>
            <p>
              Start with your company knowledge, test the answers and add the assistant to your website when you are ready
            </p>
          </div>

          <div className="faq-list">
            <details open>
              <summary>What can I add as knowledge?</summary>
              <p>
                Add PDF, TXT and Markdown files, or paste text directly for quick knowledge entries
              </p>
            </details>

            <details>
              <summary>What happens when the answer is not in my company knowledge?</summary>
              <p>
                The assistant answers from retrieved company knowledge and says
                when the available sources do not contain the requested
                information
              </p>
            </details>

            <details>
              <summary>Can I check where an answer came from?</summary>
              <p>
                Yes. Answers from your knowledge show source references such as the file
                name and page where available
              </p>
            </details>

            <details>
              <summary>Can I add the assistant to my website?</summary>
              <p>
                Yes. Website chat is included in Pro. Add Anvera to your website
                with the provided embed code and let customers ask questions
                directly from your company knowledge
              </p>
            </details>

            <details>
              <summary>Will I be charged during the product demo?</summary>
              <p>
                No. The MVP uses a clearly labelled mock checkout and does not
                collect real card details
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <div className="cta-panel">
            <div>
              <span className="section-kicker light-kicker">GET STARTED</span>
              <h2>Give customers answers backed by your actual company knowledge</h2>
            </div>
            <a
              className="button button-light"
              href={primaryHref}
            >
              {primaryLabel}
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <Link
            className="brand footer-brand"
            href="/"
            aria-label="Anvera home"
          >
            <AnveraLogo
              width={108}
            />
          </Link>

          <p>AI support grounded in your company knowledge</p>

          <div className="footer-links">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
