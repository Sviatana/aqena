import type {
  EmailOtpType,
} from "@supabase/supabase-js";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  safeNextPath,
} from "@/lib/safe-next-path";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
) {
  const url = new URL(request.url);

  const tokenHash =
    url.searchParams.get("token_hash");

  const type =
    url.searchParams.get("type") as EmailOtpType | null;

  const next =
    safeNextPath(
      url.searchParams.get("next"),
    );

  if (tokenHash && type) {
    const supabase = await createClient();

    const {
      error,
    } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(
        new URL(next, request.url),
      );
    }

    console.error(
      "AUTH_TOKEN_HASH_VERIFY_FAILED",
      {
        code: error.code,
        status: error.status,
        message: error.message,
        type,
      },
    );
  }

  const target = new URL(
    "/auth/login",
    request.url,
  );

  target.searchParams.set(
    "error",
    "This confirmation link is invalid or has expired.",
  );

  return NextResponse.redirect(target);
}
