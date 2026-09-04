import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "server-only",
  () => ({}),
);

import {
  canonicalSiteUrl,
} from "@/lib/site-url";

const original =
  process.env
    .NEXT_PUBLIC_SITE_URL;

afterEach(
  () => {
    if (
      original
      === undefined
    ) {
      delete process.env
        .NEXT_PUBLIC_SITE_URL;
    } else {
      process.env
        .NEXT_PUBLIC_SITE_URL =
        original;
    }
  },
);

describe(
  "canonical site URL",
  () => {
    it(
      "returns the configured HTTPS origin",
      () => {
        process.env
          .NEXT_PUBLIC_SITE_URL =
          "https://anvera.example/";

        expect(
          canonicalSiteUrl(),
        ).toBe(
          "https://anvera.example",
        );
      },
    );

    it(
      "preserves a local development port",
      () => {
        process.env
          .NEXT_PUBLIC_SITE_URL =
          "http://localhost:3001";

        expect(
          canonicalSiteUrl(),
        ).toBe(
          "http://localhost:3001",
        );
      },
    );

    it(
      "fails closed when configuration is missing",
      () => {
        delete process.env
          .NEXT_PUBLIC_SITE_URL;

        expect(
          () =>
            canonicalSiteUrl(),
        ).toThrow(
          "NEXT_PUBLIC_SITE_URL is not configured",
        );
      },
    );

    it(
      "rejects a non-http scheme",
      () => {
        process.env
          .NEXT_PUBLIC_SITE_URL =
          "javascript:alert(1)";

        expect(
          () =>
            canonicalSiteUrl(),
        ).toThrow(
          "NEXT_PUBLIC_SITE_URL must use http or https",
        );
      },
    );

    it(
      "rejects URL credentials",
      () => {
        process.env
          .NEXT_PUBLIC_SITE_URL =
          "https://user:pass@anvera.example";

        expect(
          () =>
            canonicalSiteUrl(),
        ).toThrow(
          "NEXT_PUBLIC_SITE_URL must not contain credentials",
        );
      },
    );
  },
);
