import "server-only";

export function canonicalSiteUrl() {
  const configured =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (!configured) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not configured",
    );
  }

  let url: URL;

  try {
    url =
      new URL(
        configured,
      );
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an absolute URL",
    );
  }

  if (
    url.protocol !== "http:"
    && url.protocol !== "https:"
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must use http or https",
    );
  }

  if (
    url.username
    || url.password
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must not contain credentials",
    );
  }

  return url.origin;
}
