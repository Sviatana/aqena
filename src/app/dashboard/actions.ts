"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getServerDictionary,
} from "@/i18n/server";
import {
  KNOWLEDGE_BUCKET,
} from "@/lib/knowledge";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AssistantInsert =
  Database["public"]["Tables"]["assistants"]["Insert"];

const DEFAULT_BRAND_COLOR =
  "#1d1e1a";

const BRAND_COLOR_PATTERN =
  /^#[0-9a-f]{6}$/i;

function textValue(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function errorRedirect(
  message: string,
): never {
  redirect(
    `/dashboard/assistants/new?error=${encodeURIComponent(message)}`,
  );
}

export async function createAssistant(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.newAssistant;

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
    redirect("/auth/login");
  }

  const name =
    textValue(
      formData,
      "name",
    );

  const description =
    textValue(
      formData,
      "description",
    );

  const instructions =
    textValue(
      formData,
      "instructions",
    );

  const welcomeMessage =
    textValue(
      formData,
      "welcomeMessage",
    );

  const brandColor =
    (
      textValue(
        formData,
        "brandColor",
      )
      || DEFAULT_BRAND_COLOR
    ).toLowerCase();

  if (!name) {
    errorRedirect(
      copy.errors.nameRequired,
    );
  }

  if (name.length > 80) {
    errorRedirect(
      copy.errors.nameTooLong,
    );
  }

  if (description.length > 500) {
    errorRedirect(
      copy.errors.descriptionTooLong,
    );
  }

  if (instructions.length > 4000) {
    errorRedirect(
      copy.errors.instructionsTooLong,
    );
  }

  if (welcomeMessage.length > 500) {
    errorRedirect(
      copy.errors.welcomeTooLong,
    );
  }

  if (
    !BRAND_COLOR_PATTERN.test(
      brandColor,
    )
  ) {
    errorRedirect(
      copy.errors.invalidBrandColor,
    );
  }

  const {
    data: subscription,
    error: subscriptionError,
  } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscriptionError) {
    errorRedirect(
      copy.errors.planCheckFailed,
    );
  }

  const plan =
    subscription?.plan === "pro"
      ? "pro"
      : "free";

  const assistantLimit =
    plan === "pro"
      ? 5
      : 1;

  const {
    count,
    error: countError,
  } = await supabase
    .from("assistants")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    );

  if (countError) {
    errorRedirect(
      copy.errors.assistantLimitCheckFailed,
    );
  }

  if (
    (count ?? 0)
    >= assistantLimit
  ) {
    errorRedirect(
      plan === "free"
        ? copy.errors.freeLimit
        : copy.errors.proLimit,
    );
  }

  const payload:
    AssistantInsert = {
      owner_id:
        userId,
      name,
      description,
      brand_color:
        brandColor,
      welcome_message:
        welcomeMessage
        || copy.defaultWelcomeMessage,
  };

  if (instructions) {
    payload.instructions =
      instructions;
  }

  const {
    data: assistant,
    error: insertError,
  } = await supabase
    .from("assistants")
    .insert(payload)
    .select("id")
    .single();

  if (
    insertError
    || !assistant
  ) {
    errorRedirect(
      copy.errors.createFailed,
    );
  }

  revalidatePath(
    "/dashboard",
  );

  redirect(
    `/dashboard/assistants/${assistant.id}?created=1`,
  );
}

const SAFE_DEFAULT_INSTRUCTIONS =
  "Answer only using the provided company knowledge. "
  + "If the answer is not supported by the knowledge, "
  + "clearly say that you could not find it.";

const DEFAULT_WELCOME_MESSAGE =
  "Hi — ask me anything about our company knowledge.";

const DEFAULT_FALLBACK_MESSAGE =
  "I could not find that in the available company knowledge.";

const ASSISTANT_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assistantDetailUrl(
  assistantId: string,
  key:
    | "error"
    | "success",
  message: string,
) {
  return (
    `/dashboard/assistants/${assistantId}`
    + `?${key}=${encodeURIComponent(message)}`
  );
}

function assistantUpdateError(
  assistantId: string,
  message: string,
): never {
  redirect(
    assistantDetailUrl(
      assistantId,
      "error",
      message,
    ),
  );
}

export async function updateAssistant(
  assistantId: string,
  formData: FormData,
) {
  if (
    !ASSISTANT_UUID_PATTERN.test(
      assistantId,
    )
  ) {
    redirect(
      "/dashboard",
    );
  }

  const copy =
    (
      await getServerDictionary()
    ).dashboard.detail;

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

  const name =
    textValue(
      formData,
      "name",
    );

  const description =
    textValue(
      formData,
      "description",
    );

  const requestedInstructions =
    textValue(
      formData,
      "instructions",
    );

  const requestedWelcome =
    textValue(
      formData,
      "welcomeMessage",
    );

  const requestedFallback =
    textValue(
      formData,
      "fallbackMessage",
    );

  const requestedBrandColor =
    (
      textValue(
        formData,
        "brandColor",
      )
      || DEFAULT_BRAND_COLOR
    ).toLowerCase();

  if (!name) {
    assistantUpdateError(
      assistantId,
      copy.errors.nameRequired,
    );
  }

  if (
    name.length
    > 80
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.nameTooLong,
    );
  }

  if (
    description.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.descriptionTooLong,
    );
  }

  if (
    requestedInstructions.length
    > 4_000
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.instructionsTooLong,
    );
  }

  if (
    requestedWelcome.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.welcomeTooLong,
    );
  }

  if (
    requestedFallback.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.fallbackTooLong,
    );
  }

  if (
    !BRAND_COLOR_PATTERN.test(
      requestedBrandColor,
    )
  ) {
    assistantUpdateError(
      assistantId,
      copy.errors.invalidBrandColor,
    );
  }

  const instructions =
    requestedInstructions
    || SAFE_DEFAULT_INSTRUCTIONS;

  const welcomeMessage =
    requestedWelcome
    || DEFAULT_WELCOME_MESSAGE;

  const fallbackMessage =
    requestedFallback
    || DEFAULT_FALLBACK_MESSAGE;

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("assistants")
    .update({
      name,
      description,
      instructions,

      welcome_message:
        welcomeMessage,

      fallback_message:
        fallbackMessage,

      brand_color:
        requestedBrandColor,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      assistantId,
    )
    .eq(
      "owner_id",
      userId,
    )
    .select(
      "id,public_id,status,is_published",
    )
    .maybeSingle();

  if (updateError) {
    console.error(
      "ASSISTANT_UPDATE_FAILED",
      {
        assistantId,
        message:
          updateError.message,
      },
    );

    assistantUpdateError(
      assistantId,
      copy.errors.saveFailed,
    );
  }

  if (!updated) {
    redirect(
      "/dashboard",
    );
  }

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  revalidatePath(
    `/dashboard/assistants/${assistantId}/playground`,
  );

  revalidatePath(
    `/dashboard/assistants/${assistantId}/install`,
  );

  revalidatePath(
    `/embed/${updated.public_id}`,
  );

  redirect(
    assistantDetailUrl(
      assistantId,
      "success",
      copy.errors.saved,
    ),
  );
}

type AdminClient =
  ReturnType<
    typeof createAdminClient
  >;

function deleteConfirmed(
  formData: FormData,
) {
  return (
    formData.get(
      "confirmDelete",
    )
    === "1"
  );
}

function dashboardAccountError(
  message: string,
): never {
  redirect(
    "/dashboard?accountError="
      + encodeURIComponent(
        message,
      ),
  );
}

async function removeStoredKnowledge(
  admin: AdminClient,
  assistantIds: string[],
) {
  if (
    assistantIds.length
    === 0
  ) {
    return null;
  }

  const {
    data: sources,
    error: sourcesError,
  } = await admin
    .from("knowledge_sources")
    .select("storage_path")
    .in(
      "assistant_id",
      assistantIds,
    );

  if (sourcesError) {
    return (
      sourcesError.message
      || "knowledge_source_lookup_failed"
    );
  }

  const storagePaths =
    Array.from(
      new Set(
        (sources ?? [])
          .map(
            (source) =>
              source.storage_path,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    );

  for (
    let index = 0;
    index < storagePaths.length;
    index += 100
  ) {
    const batch =
      storagePaths.slice(
        index,
        index + 100,
      );

    const {
      error: storageError,
    } = await admin
      .storage
      .from(KNOWLEDGE_BUCKET)
      .remove(batch);

    if (storageError) {
      return (
        storageError.message
        || "storage_cleanup_failed"
      );
    }
  }

  return null;
}

export async function deleteAssistant(
  assistantId: string,
  formData: FormData,
) {
  if (
    !ASSISTANT_UUID_PATTERN.test(
      assistantId,
    )
  ) {
    redirect("/dashboard");
  }

  const copy =
    (
      await getServerDictionary()
    ).dashboard.selfService;

  if (!deleteConfirmed(formData)) {
    assistantUpdateError(
      assistantId,
      copy.confirmationRequired,
    );
  }

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
    redirect("/auth/login");
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
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  const storageCleanupError =
    await removeStoredKnowledge(
      admin,
      [
        assistant.id,
      ],
    );

  if (storageCleanupError) {
    console.error(
      "ASSISTANT_STORAGE_CLEANUP_FAILED",
      {
        assistantId,
        message:
          storageCleanupError,
      },
    );

    assistantUpdateError(
      assistantId,
      copy.storageCleanupFailed,
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("assistants")
    .delete()
    .eq(
      "id",
      assistantId,
    )
    .eq(
      "owner_id",
      userId,
    );

  if (deleteError) {
    console.error(
      "ASSISTANT_DELETE_FAILED",
      {
        assistantId,
        code:
          deleteError.code
          ?? null,
        message:
          deleteError.message,
      },
    );

    assistantUpdateError(
      assistantId,
      copy.deleteAssistantFailed,
    );
  }

  revalidatePath(
    "/dashboard",
  );

  redirect(
    "/dashboard?deleted=1",
  );
}

export async function deleteAccount(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).dashboard.selfService;

  if (!deleteConfirmed(formData)) {
    dashboardAccountError(
      copy.confirmationRequired,
    );
  }

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
    redirect("/auth/login");
  }

  const admin =
    createAdminClient();

  const {
    data: assistants,
    error: assistantsError,
  } = await admin
    .from("assistants")
    .select("id")
    .eq(
      "owner_id",
      userId,
    );

  if (assistantsError) {
    console.error(
      "ACCOUNT_ASSISTANT_LOOKUP_FAILED",
      {
        userId,
        code:
          assistantsError.code
          ?? null,
        message:
          assistantsError.message,
      },
    );

    dashboardAccountError(
      copy.deleteAccountFailed,
    );
  }

  const assistantIds =
    (assistants ?? [])
      .map(
        (assistant) =>
          assistant.id,
      );

  const storageCleanupError =
    await removeStoredKnowledge(
      admin,
      assistantIds,
    );

  if (storageCleanupError) {
    console.error(
      "ACCOUNT_STORAGE_CLEANUP_FAILED",
      {
        userId,
        message:
          storageCleanupError,
      },
    );

    dashboardAccountError(
      copy.storageCleanupFailed,
    );
  }

  const {
    error: deleteUserError,
  } =
    await admin.auth.admin
      .deleteUser(
        userId,
      );

  if (deleteUserError) {
    console.error(
      "ACCOUNT_DELETE_FAILED",
      {
        userId,
        message:
          deleteUserError.message,
      },
    );

    dashboardAccountError(
      copy.deleteAccountFailed,
    );
  }

  await supabase.auth.signOut();

  redirect(
    "/auth/login?message="
      + encodeURIComponent(
        copy.accountDeletedSuccess,
      ),
  );
}
