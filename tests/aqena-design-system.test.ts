import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const tokens =
  readFileSync(
    "src/app/aqena-app-tokens.css",
    "utf8",
  );

const layout =
  readFileSync(
    "src/app/layout.tsx",
    "utf8",
  );

const auth =
  readFileSync(
    "src/app/auth/auth.module.css",
    "utf8",
  );

const dashboard =
  readFileSync(
    "src/app/dashboard/dashboard.module.css",
    "utf8",
  );

const install =
  readFileSync(
    "src/app/dashboard/assistants/[id]/install/install.module.css",
    "utf8",
  );

const billing =
  readFileSync(
    "src/app/dashboard/billing/upgrade/upgrade.module.css",
    "utf8",
  );

const billingPage =
  readFileSync(
    "src/app/dashboard/billing/upgrade/page.tsx",
    "utf8",
  );

const admin =
  readFileSync(
    "src/app/platform-admin/platform-admin.module.css",
    "utf8",
  );

const widget =
  readFileSync(
    "src/app/embed/[publicId]/widget.module.css",
    "utf8",
  );

describe(
  "AQENA application design system",
  () => {
    it(
      "defines the shared neutral application token system",
      () => {
        expect(tokens).toContain(
          "--aq-app-bg: #f7f7f5",
        );

        expect(tokens).toContain(
          "--aq-app-surface: #ffffff",
        );

        expect(tokens).toContain(
          "--aq-app-text: #1d1d1b",
        );

        expect(tokens).toContain(
          "--aq-app-accent: #f29a2e",
        );

        expect(tokens).toContain(
          "--aq-app-focus:",
        );

        expect(tokens).toContain(
          "--aq-app-radius-md:",
        );
      },
    );

    it(
      "loads application tokens after legacy global landing CSS",
      () => {
        const globalIndex =
          layout.indexOf(
            'import "./globals.css"',
          );

        const tokenIndex =
          layout.indexOf(
            'import "./aqena-app-tokens.css"',
          );

        expect(globalIndex).toBeGreaterThanOrEqual(
          0,
        );

        expect(tokenIndex).toBeGreaterThan(
          globalIndex,
        );
      },
    );

    it(
      "uses shared tokens across application surfaces",
      () => {
        for (
          const source
          of [
            auth,
            dashboard,
            install,
            billing,
            admin,
            widget,
          ]
        ) {
          expect(source).toContain(
            "var(--aq-app-",
          );
        }
      },
    );

    it(
      "uses orange focus instead of decorative sage in auth",
      () => {
        expect(auth).not.toContain(
          "#8a9c82",
        );

        expect(auth).not.toContain(
          "#7e9175",
        );

        expect(auth).toContain(
          "var(--aq-app-accent)",
        );
      },
    );

    it(
      "makes dashboard navigation quieter and workspace primary",
      () => {
        expect(dashboard).toContain(
          "grid-template-columns: 224px minmax(0, 1fr)",
        );

        expect(dashboard).toContain(
          "position: sticky",
        );

        expect(dashboard).toContain(
          "backdrop-filter: blur(14px)",
        );
      },
    );

    it(
      "uses a graphite user-message treatment in playground",
      () => {
        expect(dashboard).toContain(
          '.playgroundMessage[data-role="user"] .playgroundBubble',
        );

        expect(dashboard).toContain(
          "background: var(--aq-app-text)",
        );

        expect(dashboard).toContain(
          "box-shadow: var(--aq-app-focus)",
        );
      },
    );

    it(
      "removes billing inline spacing and uses request styling",
      () => {
        expect(billingPage).not.toContain(
          'marginTop: "28px"',
        );

        expect(billingPage).toContain(
          "styles.introBlock",
        );

        expect(billing).toContain(
          ".introBlock",
        );

        expect(billing).toContain(
          ".requestBadge",
        );

        expect(billing).toContain(
          "var(--aq-app-accent-soft)",
        );
      },
    );

    it(
      "keeps Pro and owner emphasis in the AQENA accent family",
      () => {
        expect(install).toContain(
          "var(--aq-app-accent-soft)",
        );

        expect(admin).toContain(
          "var(--aq-app-accent",
        );
      },
    );

    it(
      "uses product typography and shared focus inside widget",
      () => {
        expect(widget).toContain(
          "var(--font-geist-sans)",
        );

        expect(widget).toContain(
          "var(--brand-color, var(--aq-app-accent))",
        );

        expect(widget).toContain(
          "box-shadow: var(--aq-app-focus)",
        );
      },
    );
  },
);
