import "server-only";

import {
  createClient as createAdminClient,
} from "@supabase/supabase-js";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  createClient as createServerClient,
} from "@/lib/supabase/server";

export const PLATFORM_OWNER_EMAIL =
  "ssidaren@gmail.com";

function normalizedEmail(
  value: string | undefined,
) {
  return (value ?? "")
    .trim()
    .toLowerCase();
}

function platformAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

  const secret =
    process.env.SUPABASE_SECRET_KEY
    ?.trim();

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured",
    );
  }

  if (!secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not configured",
    );
  }

  return createAdminClient(
    url,
    secret,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function requirePlatformOwner() {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (
    error
    || !data.user
  ) {
    redirect(
      "/auth/login",
    );
  }

  const user =
    data.user;

  const isOwner =
    normalizedEmail(
      user.email,
    )
    === PLATFORM_OWNER_EMAIL;

  const isConfirmed =
    Boolean(
      user.email_confirmed_at,
    );

  if (
    !isOwner
    || !isConfirmed
  ) {
    /*
     * Do not expose whether an administrative
     * route exists to normal product users.
     */
    notFound();
  }

  return {
    owner: user,
    admin:
      platformAdminClient(),
  };
}
