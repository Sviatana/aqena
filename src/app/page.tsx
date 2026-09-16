import { LanguageSwitch } from "@/components/language-switch";
import Link from "next/link";

import {
  AqenaLogo,
  AqenaMark,
} from "@/components/aqena-brand";
import {
  getServerDictionary,
} from "@/i18n/server";
import {
  createClient,
} from "@/lib/supabase/server";

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
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
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
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
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
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
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
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
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
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
  const dictionary =
    await getServerDictionary();

  const copy =
    dictionary.landing;

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
      ? copy.navigation.openDashboard
      : copy.navigation.buildAssistant;

  return (
    <main className="aqena-landing">
      <header className="site-header">
        <div className="container header-inner">
          <Link
            className="brand"
            href="/"
            aria-label={copy.homeLabel}
          >
            <AqenaLogo
              priority
              width={108}
            />
          </Link>

          <nav
            className="desktop-nav"
            aria-label={copy.navigation.howItWorks}
          >
            <a href="#how-it-works">
              {copy.navigation.howItWorks}
            </a>
            <a href="#features">
              {copy.navigation.features}
            </a>
            <a href="#pricing">
              {copy.navigation.pricing}
            </a>
            <a href="#faq">
              {copy.navigation.faq}
            </a>
          </nav>

          <div className="header-actions">
            <a
              className="text-link demo-link"
              href="/demo/northstar-coffee"
            >
              {copy.navigation.demo}
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
                ? copy.navigation.dashboard
                : copy.navigation.signIn}
            </a>

                        <LanguageSwitch variant="header" />

<a
              className="button button-small"
              href={primaryHref}
            >
              {primaryLabel}
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {copy.hero.eyebrow}
            </div>

            <h1>
              {copy.hero.title}
            </h1>

            <p className="hero-lead">
              {copy.hero.lead}
            </p>

            <div className="hero-actions">
              <a
                className="button button-primary"
                href={primaryHref}
              >
                {primaryLabel}
                <ArrowIcon />
              </a>

              <a
                className="button button-secondary"
                href="#how-it-works"
              >
                {copy.hero.secondaryCta}
              </a>
            </div>

            <div className="trust-row">
              <span>
                <CheckIcon />
                {copy.hero.trustAnswers}
              </span>

              <span>
                <CheckIcon />
                {copy.hero.trustSources}
              </span>

              <span>
                <CheckIcon />
                {copy.hero.trustNoCard}
              </span>
            </div>
          </div>

          <div
            className="hero-product"
            aria-label={
              copy.hero.productPreviewLabel
            }
          >
            <div className="product-window">
              <div className="window-topbar">
                <div
                  className="window-dots"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>

                <span className="window-title">
                  {copy.hero.assistantTitle}
                </span>

                <span className="status-pill">
                  <span />
                  {copy.hero.ready}
                </span>
              </div>

              <div className="assistant-shell">
                <aside className="assistant-sidebar">
                  <div className="sidebar-brand">
                    <AqenaMark
                      className="mini-mark-image"
                      size={22}
                    />
                    <strong>AQENA</strong>
                  </div>

                  <div className="sidebar-label">
                    {copy.hero.workspace}
                  </div>

                  <div className="sidebar-item active">
                    <ChatIcon />
                    {copy.hero.playground}
                  </div>

                  <div className="sidebar-item">
                    <FileIcon />
                    {copy.hero.knowledge}
                  </div>

                  <div className="sidebar-item">
                    <CodeIcon />
                    {copy.hero.install}
                  </div>
                </aside>

                <div className="chat-preview">
                  <div className="chat-heading">
                    <div>
                      <span className="chat-label">
                        {copy.hero.playground.toUpperCase()}
                      </span>

                      <h2>
                        {copy.hero.testAssistant}
                      </h2>
                    </div>

                    <span className="model-status">
                      {copy.hero.sourcesReady}
                    </span>
                  </div>

                  <div className="chat-messages">
                    <div className="message user-message">
                      {copy.hero.questionDelivery}
                    </div>

                    <div className="message assistant-message">
                      <div className="assistant-avatar">
                        N
                      </div>

                      <div>
                        <p>
                          {copy.hero.answerDelivery}
                        </p>

                        <div className="source-card">
                          <FileIcon />

                          <div>
                            <strong>
                              {copy.hero.deliveryDocument}
                            </strong>
                            <span>
                              {copy.hero.pageTwo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="message user-message short">
                      {copy.hero.questionReturn}
                    </div>

                    <div className="typing-row">
                      <div className="assistant-avatar">
                        N
                      </div>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="chat-input">
                    <span>
                      {copy.hero.input}
                    </span>

                    <button
                      type="button"
                      aria-label={copy.preview.input}
                    >
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
                <strong>
                  {copy.hero.sourcesReady}
                </strong>
                <span>
                  {copy.hero.knowledgeReady}
                </span>
              </div>

              <span className="success-dot">
                ✓
              </span>
            </div>

            <div className="floating-card widget-floating-card">
              <span className="floating-icon dark">
                <CodeIcon />
              </span>

              <div>
                <strong>
                  {copy.hero.websiteChat}
                </strong>
                <span>
                  {copy.hero.quickSetup}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section">
        <div className="container narrow-container">
          <div className="section-heading centered">
            <span className="section-kicker">
              {copy.problem.kicker}
            </span>

            <h2>
              {copy.problem.title}
            </h2>

            <p>
              {copy.problem.body}
            </p>
          </div>

          <div className="problem-grid">
            <article>
              <span className="problem-number">
                01
              </span>
              <h3>
                {copy.problem.firstTitle}
              </h3>
              <p>
                {copy.problem.firstBody}
              </p>
            </article>

            <article>
              <span className="problem-number">
                02
              </span>
              <h3>
                {copy.problem.secondTitle}
              </h3>
              <p>
                {copy.problem.secondBody}
              </p>
            </article>

            <article>
              <span className="problem-number">
                03
              </span>
              <h3>
                {copy.problem.thirdTitle}
              </h3>
              <p>
                {copy.problem.thirdBody}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="how-section"
        id="how-it-works"
      >
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              {copy.how.kicker}
            </span>
            <h2>
              {copy.how.title}
            </h2>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-top">
                <span className="step-number">
                  01
                </span>
                <span className="feature-icon">
                  <FileIcon />
                </span>
              </div>

              <h3>
                {copy.how.firstTitle}
              </h3>

              <p>
                {copy.how.firstBody}
              </p>

              <div className="mini-ui files-mini-ui">
                <span>
                  <FileIcon />
                  {copy.how.firstFile}
                  <b>
                    {copy.how.ready}
                  </b>
                </span>

                <span>
                  <FileIcon />
                  {copy.how.secondFile}
                  <b>
                    {copy.how.ready}
                  </b>
                </span>
              </div>
            </article>

            <article className="step-card">
              <div className="step-top">
                <span className="step-number">
                  02
                </span>
                <span className="feature-icon">
                  <ChatIcon />
                </span>
              </div>

              <h3>
                {copy.how.secondTitle}
              </h3>

              <p>
                {copy.how.secondBody}
              </p>

              <div className="mini-ui question-mini-ui">
                <span>
                  {copy.how.sampleQuestion}
                </span>

                <div>
                  <i>A</i>
                  <p>
                    {copy.how.sampleAnswer}
                  </p>
                </div>
              </div>
            </article>

            <article className="step-card">
              <div className="step-top">
                <span className="step-number">
                  03
                </span>
                <span className="feature-icon">
                  <CodeIcon />
                </span>
              </div>

              <h3>
                {copy.how.thirdTitle}
              </h3>

              <p>
                {copy.how.thirdBody}
              </p>

              <div className="mini-ui code-mini-ui">
                <strong className="install-ready">
                  {copy.how.installReady}
                </strong>
                <span>
                  {copy.how.copyCode}
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="features-section"
        id="features"
      >
        <div className="container trust-layout">
          <div className="trust-heading">
            <div className="trust-heading-main">
              <p className="section-kicker">
                {copy.trust.kicker}
              </p>

              <h2>
                {copy.trust.title}
              </h2>
            </div>

            <p className="trust-heading-copy">
              {copy.trust.body}
            </p>
          </div>

          <div className="trust-board">
            <article className="trust-item">
              <span className="trust-number">
                01
              </span>

              <div>
                <h3>
                  {copy.trust.firstTitle}
                </h3>
                <p>
                  {copy.trust.firstBody}
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">
                  ✓
                </span>
                {copy.trust.firstProof}
              </span>
            </article>

            <article className="trust-item">
              <span className="trust-number">
                02
              </span>

              <div>
                <h3>
                  {copy.trust.secondTitle}
                </h3>
                <p>
                  {copy.trust.secondBody}
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">
                  ✓
                </span>
                {copy.trust.secondProof}
              </span>
            </article>

            <article className="trust-item">
              <span className="trust-number">
                03
              </span>

              <div>
                <h3>
                  {copy.trust.thirdTitle}
                </h3>
                <p>
                  {copy.trust.thirdBody}
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">
                  ✓
                </span>
                {copy.trust.thirdProof}
              </span>
            </article>

            <article className="trust-item trust-item-accent">
              <span className="trust-number">
                04
              </span>

              <div>
                <h3>
                  {copy.trust.fourthTitle}
                </h3>
                <p>
                  {copy.trust.fourthBody}
                </p>
              </div>

              <span className="trust-proof">
                <span aria-hidden="true">
                  ✓
                </span>
                {copy.trust.fourthProof}
              </span>
            </article>
          </div>
        </div>
      </section>

      <section
        className="preview-section"
        id="product-preview"
      >
        <div className="container">
          <div className="preview-panel">
            <div className="preview-copy">
              <span className="section-kicker light-kicker">
                {copy.preview.kicker}
              </span>

              <h2>
                {copy.preview.title}
              </h2>

              <p>
                {copy.preview.body}
              </p>

              <ul className="preview-list">
                <li>
                  <CheckIcon />
                  {copy.preview.firstPoint}
                </li>
                <li>
                  <CheckIcon />
                  {copy.preview.secondPoint}
                </li>
                <li>
                  <CheckIcon />
                  {copy.preview.thirdPoint}
                </li>
              </ul>

              <a
                className="button-secondary preview-demo-button"
                href="/demo/northstar-coffee"
              >
                {copy.preview.liveDemo}
              </a>
            </div>

            <div className="preview-chat">
              <div className="preview-chat-top">
                <div>
                  <span className="preview-avatar">
                    N
                  </span>

                  <div>
                    <strong>
                      Northstar Coffee
                    </strong>
                    <small>
                      {copy.preview.assistantLabel}
                    </small>
                  </div>
                </div>

                <span className="online-status">
                  {copy.preview.online}
                </span>
              </div>

              <div className="preview-chat-body">
                <div className="preview-bubble assistant-bubble">
                  {copy.preview.welcome}
                </div>

                <div className="preview-bubble customer-bubble">
                  {copy.preview.question}
                </div>

                <div className="preview-bubble assistant-bubble">
                  {copy.preview.answer}

                  <div className="inline-source">
                    <FileIcon />
                    {copy.preview.source}
                  </div>
                </div>
              </div>

              <div className="preview-chat-input">
                <span>
                  {copy.preview.input}
                </span>
                <i>
                  <ArrowIcon />
                </i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="pricing-section"
        id="pricing"
      >
        <div className="container pricing-container">
          <div className="section-heading centered">
            <span className="section-kicker">
              {copy.pricing.kicker}
            </span>

            <h2>
              {copy.pricing.title}
            </h2>

            <p>
              {copy.pricing.body}
            </p>
          </div>

          <div className="pricing-grid">
            <article className="pricing-card">
              <div className="plan-heading">
                <h3>
                  {copy.pricing.freeName}
                </h3>
                <p>
                  {copy.pricing.freeDescription}
                </p>
              </div>

              <div className="price">
                <strong>0</strong>
                <span>
                  {copy.pricing.forever}
                </span>
              </div>

              <a
                className="button button-plan-secondary"
                href={primaryHref}
              >
                {copy.pricing.startFree}
              </a>

              <ul>
                <li>
                  <CheckIcon />
                  {copy.pricing.freeAssistant}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.freeSources}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.freeMessages}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.playground}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.basicCustomization}
                </li>
              </ul>
            </article>

            <article
              className="pricing-card pricing-card-pro"
              id="pro-plan"
            >
              <div className="popular-badge">
                {copy.pricing.bestForWebsites}
              </div>

              <div className="plan-heading">
                <h3>
                  {copy.pricing.proName}
                </h3>
              </div>

              <div className="launch-price-block">
                <div className="launch-old-price">
                  <del>
                    {copy.pricing.proOldPrice}
                  </del>
                </div>

                <div className="price">
                  <strong>
                    {copy.pricing.proPrice}
                  </strong>

                  <span>
                    {copy.pricing.perMonth}
                  </span>
                </div>

                {copy.pricing.showSecondaryPrice ? (
                  <div className="launch-secondary-price">
                    <span>
                      {copy.pricing.proSecondaryLabel}
                    </span>

                    <del>
                      {copy.pricing.proSecondaryOldPrice}
                    </del>

                    <strong>
                      {copy.pricing.proSecondaryPrice}
                    </strong>
                  </div>
                ) : null}
              </div>

              <a
                className="button button-plan-primary"
                href={primaryHref}
              >
                {copy.pricing.choosePro}
              </a>

              <ul>
                <li>
                  <CheckIcon />
                  {copy.pricing.proAssistants}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.proSources}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.proMessages}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.addWebsite}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.customBranding}
                </li>
                <li>
                  <CheckIcon />
                  {copy.pricing.advancedCustomization}
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section
        className="faq-section"
        id="faq"
      >
        <div className="container faq-grid">
          <div className="faq-heading">
            <span className="section-kicker">
              {copy.faq.kicker}
            </span>

            <h2>
              {copy.faq.title}
            </h2>

            <p>
              {copy.faq.body}
            </p>
          </div>

          <div className="faq-list">
            <details open>
              <summary>
                {copy.faq.firstQuestion}
              </summary>
              <p>
                {copy.faq.firstAnswer}
              </p>
            </details>

            <details>
              <summary>
                {copy.faq.secondQuestion}
              </summary>
              <p>
                {copy.faq.secondAnswer}
              </p>
            </details>

            <details>
              <summary>
                {copy.faq.thirdQuestion}
              </summary>
              <p>
                {copy.faq.thirdAnswer}
              </p>
            </details>

            <details>
              <summary>
                {copy.faq.fourthQuestion}
              </summary>
              <p>
                {copy.faq.fourthAnswer}
              </p>
            </details>

            <details>
              <summary>
                {copy.faq.fifthQuestion}
              </summary>
              <p>
                {copy.faq.fifthAnswer}
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <div className="cta-panel">
            <div>
              <span className="section-kicker light-kicker">
                {copy.cta.kicker}
              </span>
              <h2>
                {copy.cta.title}
              </h2>
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
            className="brand"
            href="/"
            aria-label={copy.homeLabel}
          >
            <AqenaLogo
              width={108}
            />
          </Link>

          <p>
            {copy.footer.tagline}
          </p>

          <div className="footer-links">
            <a href="#how-it-works">
              {copy.navigation.howItWorks}
            </a>
            <a href="#pricing">
              {copy.navigation.pricing}
            </a>
            <a href="#faq">
              {copy.navigation.faq}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
