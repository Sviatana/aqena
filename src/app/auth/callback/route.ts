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

  const code =
    url.searchParams.get("code");

  const flowId =
    url.searchParams.get("sb_flow_id");

  const next =
    safeNextPath(
      url.searchParams.get("next"),
    );

  if (code) {
    const supabase = await createClient();

    const {
      error,
    } =
      await supabase.auth.exchangeCodeForSession(
        code,
        flowId
          ? {
              flowId,
            }
          : undefined,
      );

    if (!error) {
      return NextResponse.redirect(
        new URL(next, request.url),
      );
    }

    console.error(
      "AUTH_CODE_EXCHANGE_FAILED",
      {
        code: error.code,
        status: error.status,
        message: error.message,
        hasFlowId: Boolean(flowId),
      },
    );
  }

  const target = new URL(
    "/auth/login",
    request.url,
  );

  target.searchParams.set(
    "error",
    "This authentication link is invalid or has expired.",
  );

  return NextResponse.redirect(target);
}
