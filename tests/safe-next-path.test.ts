import {
  describe,
  expect,
  it,
} from "vitest";

import {
  safeNextPath,
} from "@/lib/safe-next-path";

describe(
  "safe auth next path",
  () => {
    it(
      "preserves a normal internal path",
      () => {
        expect(
          safeNextPath(
            "/dashboard",
          ),
        ).toBe(
          "/dashboard",
        );
      },
    );

    it(
      "preserves internal query and hash components",
      () => {
        expect(
          safeNextPath(
            "/auth/update-password?source=recovery#form",
          ),
        ).toBe(
          "/auth/update-password?source=recovery#form",
        );
      },
    );

    it(
      "rejects a protocol-relative external URL",
      () => {
        expect(
          safeNextPath(
            "//evil.example/path",
          ),
        ).toBe(
          "/dashboard",
        );
      },
    );

    it(
      "rejects the backslash WHATWG URL bypass",
      () => {
        const malicious =
          "/\\evil.example/path";

        expect(
          new URL(
            malicious,
            "https://aqena.example",
          ).origin,
        ).toBe(
          "https://evil.example",
        );

        expect(
          safeNextPath(
            malicious,
          ),
        ).toBe(
          "/dashboard",
        );
      },
    );

    it(
      "rejects an absolute external URL",
      () => {
        expect(
          safeNextPath(
            "https://evil.example/path",
          ),
        ).toBe(
          "/dashboard",
        );
      },
    );

    it(
      "uses the requested fallback for invalid input",
      () => {
        expect(
          safeNextPath(
            null,
            "/auth/login",
          ),
        ).toBe(
          "/auth/login",
        );
      },
    );
  },
);
