import {
  describe,
  expect,
  it,
} from "vitest";

import nextConfig from "../next.config";

describe(
  "security response headers",
  () => {
    it(
      "adds the approved global security headers",
      async () => {
        expect(
          nextConfig.headers,
        ).toBeTypeOf(
          "function",
        );

        if (!nextConfig.headers) {
          throw new Error(
            "Expected Next.js headers configuration",
          );
        }

        const rules =
          await nextConfig.headers();

        const globalRule =
          rules.find(
            (rule) =>
              rule.source
              === "/(.*)",
          );

        expect(
          globalRule,
        ).toBeDefined();

        const headers =
          Object.fromEntries(
            (
              globalRule
                ?.headers
              ?? []
            ).map(
              (header) => [
                header.key,
                header.value,
              ],
            ),
          );

        expect(
          headers,
        ).toMatchObject({
          "X-Content-Type-Options":
            "nosniff",

          "Referrer-Policy":
            "strict-origin-when-cross-origin",

          "Permissions-Policy":
            "camera=(), microphone=(), geolocation=(), payment=(), usb=()",

          "X-Permitted-Cross-Domain-Policies":
            "none",
        });
      },
    );

    it(
      "does not configure headers that block customer-site embedding",
      async () => {
        if (!nextConfig.headers) {
          throw new Error(
            "Expected Next.js headers configuration",
          );
        }

        const rules =
          await nextConfig.headers();

        const configuredNames =
          rules.flatMap(
            (rule) =>
              rule.headers.map(
                (header) =>
                  header.key
                    .toLowerCase(),
              ),
          );

        expect(
          configuredNames,
        ).not.toContain(
          "x-frame-options",
        );

        expect(
          configuredNames,
        ).not.toContain(
          "content-security-policy",
        );

        expect(
          configuredNames,
        ).not.toContain(
          "cross-origin-resource-policy",
        );
      },
    );
  },
);
