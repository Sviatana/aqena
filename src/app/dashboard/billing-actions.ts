"use server";

import {
  redirect,
} from "next/navigation";

import {
  getServerDictionary,
} from "@/i18n/server";

import {
  isBillingEmail,
  isContactMethod,
  isPricingRegion,
  pricingForRegion,
} from "@/lib/manual-billing";

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
  options?: {
    error?: string;
    submitted?: boolean;
  },
) {
  const params =
    new URLSearchParams();

  if (assistantId) {
    params.set(
      "assistant",
      assistantId,
    );
  }

  if (options?.error) {
    params.set(
      "error",
      options.error,
    );
  }

  if (options?.submitted) {
    params.set(
      "submitted",
      "1",
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
      {
        error: message,
      },
    ),
  );
}

export async function submitManualBillingRequest(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.billing;

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

  const [
    assistantResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
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
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select(
        "plan,status",
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  if (
    assistantResult.error
    || !assistantResult.data
  ) {
    redirect(
      "/dashboard",
    );
  }

  if (
    subscriptionResult.error
  ) {
    billingError(
      assistantId,
      copy.errors.subscriptionLoadFailed,
    );
  }

  if (
    subscriptionResult.data?.plan
      === "pro"
    && subscriptionResult.data?.status
      === "active"
  ) {
    redirect(
      `/dashboard/assistants/${assistantId}/install`,
    );
  }

  const customerName =
    formText(
      formData,
      "customerName",
    );

  const companyName =
    formText(
      formData,
      "companyName",
    );

  const pricingRegion =
    formText(
      formData,
      "pricingRegion",
    );

  const email =
    formText(
      formData,
      "email",
    ).toLowerCase();

  const contactMethod =
    formText(
      formData,
      "contactMethod",
    );

  const contactValue =
    formText(
      formData,
      "contactValue",
    );

  const note =
    formText(
      formData,
      "note",
    );

  if (
    customerName.length < 1
    || customerName.length > 120
    || companyName.length > 160
    || !isPricingRegion(
      pricingRegion,
    )
    || !isBillingEmail(
      email,
    )
    || !isContactMethod(
      contactMethod,
    )
    || contactValue.length < 2
    || contactValue.length > 160
    || note.length > 1000
  ) {
    billingError(
      assistantId,
      copy.errors.requestInvalid,
    );
  }

  const pricing =
    pricingForRegion(
      pricingRegion,
    );

  const admin =
    createAdminClient();

  const {
    data: existing,
    error: existingError,
  } =
    await admin
      .from("billing_requests")
      .select(
        "id,status",
      )
      .eq(
        "user_id",
        userId,
      )
      .in(
        "status",
        [
          "pending",
          "contacted",
          "paid",
        ],
      )
      .maybeSingle();

  if (existingError) {
    billingError(
      assistantId,
      copy.errors.requestFailed,
    );
  }

  if (existing) {
    redirect(
      upgradeUrl(
        assistantId,
        {
          submitted: true,
        },
      ),
    );
  }

  const {
    error: insertError,
  } =
    await admin
      .from("billing_requests")
      .insert({
        user_id: userId,
        assistant_id:
          assistantId,
        requested_plan: "pro",
        status: "pending",
        pricing_region:
          pricingRegion,
        currency:
          pricing.currency,
        promo_amount_minor:
          pricing.promoAmountMinor,
        standard_amount_minor:
          pricing.standardAmountMinor,
        price_lock_months: 12,
        offer_code:
          "launch_first_100",
        customer_name:
          customerName,
        company_name:
          companyName || null,
        email,
        contact_method:
          contactMethod,
        contact_value:
          contactValue,
        note:
          note || null,
      });

  if (insertError) {
    if (
      insertError.code
        === "23505"
    ) {
      redirect(
        upgradeUrl(
          assistantId,
          {
            submitted: true,
          },
        ),
      );
    }

    billingError(
      assistantId,
      copy.errors.requestFailed,
    );
  }

  redirect(
    upgradeUrl(
      assistantId,
      {
        submitted: true,
      },
    ),
  );
}
