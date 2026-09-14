export type PricingRegion =
  | "by"
  | "ru"
  | "intl";

export type ContactMethod =
  | "telegram"
  | "phone";

export const MANUAL_PRICING = {
  by: {
    currency: "BYN",
    promoAmountMinor: 4900,
    standardAmountMinor: 7900,
  },
  ru: {
    currency: "RUB",
    promoAmountMinor: 149000,
    standardAmountMinor: 249000,
  },
  intl: {
    currency: "USD",
    promoAmountMinor: 1900,
    standardAmountMinor: 2900,
  },
} as const;

export function isPricingRegion(
  value: string,
): value is PricingRegion {
  return (
    value === "by"
    || value === "ru"
    || value === "intl"
  );
}

export function isContactMethod(
  value: string,
): value is ContactMethod {
  return (
    value === "telegram"
    || value === "phone"
  );
}

export function isBillingEmail(
  value: string,
) {
  return (
    value.length <= 320
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value,
    )
  );
}

export function pricingForRegion(
  region: PricingRegion,
) {
  return MANUAL_PRICING[region];
}
