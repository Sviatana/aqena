"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formText(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function upgradeUrl(
  assistantId: string,
  error?: string,
) {
  const params =
    new URLSearchParams();

  if (assistantId) {
    params.set(
      "assistant",
      assistantId,
    );
  }

  if (error) {
    params.set(
      "error",
      error,
    );
  }

  const query =
    params.toString();

  return query
    ? `/dashboard/billing/upgrade?${query}`
    : "/dashboard/billing/upgrade";
}

function billingError(
  assistantId: string,
  message: string,
): never {
  redirect(
    upgradeUrl(
      assistantId,
      message,
    ),
  );
}

export async function completeMockUpgrade(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError
    || !userId
  ) {
    redirect(
      "/auth/login",
    );
  }

  const assistantId =
    formText(
      formData,
      "assistantId",
    );

  if (
    !assistantId
    || !UUID_PATTERN.test(
      assistantId,
    )
  ) {
    redirect(
      "/dashboard",
    );
  }

  const {
    data: assistant,
    error: assistantError,
  } = await supabase
    .from("assistants")
    .select("id")
    .eq(
      "id",
      assistantId,
    )
    .eq(
      "owner_id",
      userId,
    )
    .maybeSingle();

  if (
    assistantError
    || !assistant
  ) {
    redirect(
      "/dashboard",
    );
  }

  if (
    process.env.BILLING_MODE
      ?.trim()
      .toLowerCase()
    !== "mock"
  ) {
    billingError(
      assistantId,
      "Mock billing is not enabled for this environment.",
    );
  }

  const now =
    new Date();

  const periodEnd =
    new Date(
      now.getTime(),
    );

  periodEnd.setUTCMonth(
    periodEnd.getUTCMonth()
    + 1,
  );

  const admin =
    createAdminClient();

  const {
    data: subscription,
    error: updateError,
  } = await admin
    .from("subscriptions")
    .update({
      plan: "pro",
      status: "active",
      billing_mode: "mock",
      mock_checkout_completed_at:
        now.toISOString(),
      current_period_start:
        now.toISOString(),
      current_period_end:
        periodEnd.toISOString(),
      updated_at:
        now.toISOString(),
    })
    .eq(
      "user_id",
      userId,
    )
    .select(
      "plan,status",
    )
    .maybeSingle();

  if (
    updateError
    || !subscription
    || subscription.plan
      !== "pro"
    || subscription.status
      !== "active"
  ) {
    billingError(
      assistantId,
      "We could not complete the mock upgrade. Please try again.",
    );
  }

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  revalidatePath(
    `/dashboard/assistants/${assistantId}/install`,
  );

  redirect(
    `/dashboard/assistants/${assistantId}/install?upgraded=1`,
  );
}
