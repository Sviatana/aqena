"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AssistantInsert =
  Database["public"]["Tables"]["assistants"]["Insert"];

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
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/auth/login");
  }

  const name = textValue(
    formData,
    "name",
  );

  const description = textValue(
    formData,
    "description",
  );

  const instructions = textValue(
    formData,
    "instructions",
  );

  if (!name) {
    errorRedirect(
      "Give your assistant a name.",
    );
  }

  if (name.length > 80) {
    errorRedirect(
      "Assistant names can be up to 80 characters.",
    );
  }

  if (description.length > 500) {
    errorRedirect(
      "Description can be up to 500 characters.",
    );
  }

  if (instructions.length > 4000) {
    errorRedirect(
      "Instructions can be up to 4,000 characters.",
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
      "We could not check your plan. Please try again.",
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
      "We could not check your assistant limit.",
    );
  }

  if ((count ?? 0) >= assistantLimit) {
    errorRedirect(
      plan === "free"
        ? "The Free plan includes one assistant. Upgrade to Pro to create more."
        : "Your Pro plan includes up to five assistants.",
    );
  }

  const payload: AssistantInsert = {
    owner_id: userId,
    name,
    description,
  };

  if (instructions) {
    payload.instructions = instructions;
  }

  const {
    data: assistant,
    error: insertError,
  } = await supabase
    .from("assistants")
    .insert(payload)
    .select("id")
    .single();

  if (insertError || !assistant) {
    errorRedirect(
      "We could not create your assistant. Please try again.",
    );
  }

  revalidatePath("/dashboard");

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

  if (!name) {
    assistantUpdateError(
      assistantId,
      "Give your assistant a name.",
    );
  }

  if (
    name.length
    > 80
  ) {
    assistantUpdateError(
      assistantId,
      "Assistant names can be up to 80 characters.",
    );
  }

  if (
    description.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      "Description can be up to 500 characters.",
    );
  }

  if (
    requestedInstructions.length
    > 4_000
  ) {
    assistantUpdateError(
      assistantId,
      "Instructions can be up to 4,000 characters.",
    );
  }

  if (
    requestedWelcome.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      "Welcome messages can be up to 500 characters.",
    );
  }

  if (
    requestedFallback.length
    > 500
  ) {
    assistantUpdateError(
      assistantId,
      "Fallback messages can be up to 500 characters.",
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
      "We could not save these assistant settings. Please try again.",
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
      "Assistant settings saved.",
    ),
  );
}
