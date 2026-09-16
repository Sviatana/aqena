import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const css = readFileSync(
  "src/app/globals.css",
  "utf8",
);

const page = readFileSync(
  "src/app/page.tsx",
  "utf8",
);

describe(
  "AQENA lean landing CSS",
  () => {
    it(
      "uses one landing scope",
      () => {
        expect(page).toContain(
          '<main className="aqena-landing">',
        );

        expect(css).toContain(
          ".aqena-landing .hero{",
        );

        expect(css).toContain(
          ".aqena-landing .pricing-card{",
        );

        expect(css).toContain(
          ".aqena-landing .faq-list{",
        );
      },
    );

    it(
      "has no legacy landing selectors",
      () => {
        for (const legacy of [
          "aqena-hero-final-scope",
          "aqena-hero-title-final",
          "footer-brand",
          "FINAL LANDING",
          "FINAL VISUAL",
          "PREMIUM_REFINEMENT",
          "TYPOGRAPHY SYSTEM",
          "TYPOGRAPHY FINAL",
          "MANUAL_PRO_PRICING",
          "LEADS_PRICING_SYNC",
        ]) {
          expect(page).not.toContain(
            legacy,
          );

          expect(css).not.toContain(
            legacy,
          );
        }
      },
    );

    it(
      "keeps restrained typography",
      () => {
        expect(css).toContain(
          "font-size:clamp(38px,3.8vw,44px)",
        );

        expect(css).toContain(
          "font-size:clamp(28px,2.8vw,32px)",
        );

        expect(css).not.toMatch(
          /font-size:(?:60|62)px/
        );
      },
    );

    it(
      "keeps the global stylesheet compact",
      () => {
        expect(
          css.split("\n").length,
        ).toBeLessThan(
          400,
        );
      },
    );
  },
);
