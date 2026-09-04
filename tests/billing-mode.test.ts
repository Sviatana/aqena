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
  isMockBillingEnabled,
} from "@/lib/billing-mode";

const originalMode =
  process.env.BILLING_MODE;

const originalAllow =
  process.env.ALLOW_MOCK_BILLING;

afterEach(
  () => {
    if (
      originalMode
      === undefined
    ) {
      delete process.env
        .BILLING_MODE;
    } else {
      process.env.BILLING_MODE =
        originalMode;
    }

    if (
      originalAllow
      === undefined
    ) {
      delete process.env
        .ALLOW_MOCK_BILLING;
    } else {
      process.env
        .ALLOW_MOCK_BILLING =
        originalAllow;
    }
  },
);

describe(
  "mock billing environment guard",
  () => {
    it(
      "fails closed when the explicit allow flag is absent",
      () => {
        process.env.BILLING_MODE =
          "mock";

        delete process.env
          .ALLOW_MOCK_BILLING;

        expect(
          isMockBillingEnabled(),
        ).toBe(false);
      },
    );

    it(
      "fails closed when the explicit allow flag is false",
      () => {
        process.env.BILLING_MODE =
          "mock";

        process.env
          .ALLOW_MOCK_BILLING =
          "false";

        expect(
          isMockBillingEnabled(),
        ).toBe(false);
      },
    );

    it(
      "fails closed when billing mode is not mock",
      () => {
        process.env.BILLING_MODE =
          "disabled";

        process.env
          .ALLOW_MOCK_BILLING =
          "true";

        expect(
          isMockBillingEnabled(),
        ).toBe(false);
      },
    );

    it(
      "enables mock billing only when both explicit conditions are true",
      () => {
        process.env.BILLING_MODE =
          "mock";

        process.env
          .ALLOW_MOCK_BILLING =
          "true";

        expect(
          isMockBillingEnabled(),
        ).toBe(true);
      },
    );
  },
);
