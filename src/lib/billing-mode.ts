import "server-only";

function envFlag(
  value:
    | string
    | undefined,
) {
  return value
    ?.trim()
    .toLowerCase()
    === "true";
}

export function isMockBillingEnabled() {
  const mode =
    process.env.BILLING_MODE
      ?.trim()
      .toLowerCase();

  return (
    mode === "mock"
    && envFlag(
      process.env.ALLOW_MOCK_BILLING,
    )
  );
}
