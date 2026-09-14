import {
  describe,
  expect,
  it,
} from "vitest";

import {
  isBillingEmail,
  isContactMethod,
  isPricingRegion,
  pricingForRegion,
} from "@/lib/manual-billing";

describe(
  "manual billing pricing",
  () => {
    it(
      "uses the approved Belarus launch price",
      () => {
        expect(
          pricingForRegion("by"),
        ).toEqual({
          currency: "BYN",
          promoAmountMinor: 4900,
          standardAmountMinor: 7900,
        });
      },
    );

    it(
      "uses the approved Russia launch price",
      () => {
        expect(
          pricingForRegion("ru"),
        ).toEqual({
          currency: "RUB",
          promoAmountMinor: 149000,
          standardAmountMinor: 249000,
        });
      },
    );

    it(
      "uses the approved international launch price",
      () => {
        expect(
          pricingForRegion("intl"),
        ).toEqual({
          currency: "USD",
          promoAmountMinor: 1900,
          standardAmountMinor: 2900,
        });
      },
    );
  },
);

describe(
  "manual billing validation",
  () => {
    it(
      "accepts only supported pricing regions",
      () => {
        expect(
          isPricingRegion("by"),
        ).toBe(true);

        expect(
          isPricingRegion("ru"),
        ).toBe(true);

        expect(
          isPricingRegion("intl"),
        ).toBe(true);

        expect(
          isPricingRegion("other"),
        ).toBe(false);
      },
    );

    it(
      "accepts Telegram and phone contacts",
      () => {
        expect(
          isContactMethod("telegram"),
        ).toBe(true);

        expect(
          isContactMethod("phone"),
        ).toBe(true);

        expect(
          isContactMethod("email"),
        ).toBe(false);
      },
    );

    it(
      "validates billing email format",
      () => {
        expect(
          isBillingEmail(
            "client@example.com",
          ),
        ).toBe(true);

        expect(
          isBillingEmail(
            "not-an-email",
          ),
        ).toBe(false);
      },
    );
  },
);
