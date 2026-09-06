const SAFE_BASE_URL =
  "https://aqena.invalid";

export function safeNextPath(
  value:
    | string
    | null,
  fallback =
    "/dashboard",
) {
  if (
    !value
    || !value.startsWith("/")
  ) {
    return fallback;
  }

  try {
    const resolved =
      new URL(
        value,
        SAFE_BASE_URL,
      );

    if (
      resolved.origin
      !== SAFE_BASE_URL
    ) {
      return fallback;
    }

    return (
      resolved.pathname
      + resolved.search
      + resolved.hash
    );
  } catch {
    return fallback;
  }
}
