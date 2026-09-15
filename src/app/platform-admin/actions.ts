"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  requirePlatformOwner,
} from "@/lib/platform-owner";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManualBillingRpc =
  | "activate_manual_pro_request"
  | "cancel_manual_pro_request";

async function runManualBillingAction(
  operation: ManualBillingRpc,
  requestId: string,
) {
  if (
    !UUID_PATTERN.test(
      requestId,
    )
  ) {
    redirect(
      "/platform-admin",
    );
  }

  /*
   * requirePlatformOwner performs the real server-side
   * authorization check before the service-role client
   * can be used.
   */
  const {
    admin,
  } =
    await requirePlatformOwner();

  const {
    error,
  } =
    await admin.rpc(
      operation,
      {
        p_request_id:
          requestId,
      },
    );

  if (error) {
    console.error(
      "PLATFORM_OWNER_MANUAL_BILLING_ACTION_FAILED",
      {
        operation,
        requestId,
        code:
          error.code,
        message:
          error.message,
      },
    );

    throw new Error(
      "Не удалось выполнить операцию с тарифом. Изменения не применены.",
    );
  }

  revalidatePath(
    "/platform-admin",
  );

  redirect(
    "/platform-admin",
  );
}

export async function activateManualProRequest(
  requestId: string,
  _formData: FormData,
) {
  void _formData;

  await runManualBillingAction(
    "activate_manual_pro_request",
    requestId,
  );
}

export async function cancelManualProRequest(
  requestId: string,
  _formData: FormData,
) {
  void _formData;

  await runManualBillingAction(
    "cancel_manual_pro_request",
    requestId,
  );
}
