"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

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

function installUrl(
  assistantId: string,
  key: "success" | "error",
  message: string,
) {
  const params =
    new URLSearchParams();

  params.set(
    key,
    message,
  );

  return (
    `/dashboard/assistants/${assistantId}/install?`
    + params.toString()
  );
}

function publishError(
  assistantId: string,
  message: string,
): never {
  redirect(
    installUrl(
      assistantId,
      "error",
      message,
    ),
  );
}

export async function publishAssistant(
  formData: FormData,
) {
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

  const [
    assistantResult,
    subscriptionResult,
    readySourcesResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,is_published,status",
      )
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

    supabase
      .from("knowledge_sources")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "assistant_id",
        assistantId,
      )
      .eq(
        "status",
        "ready",
      ),
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
    publishError(
      assistantId,
      "We could not check your plan.",
    );
  }

  const isPro =
    subscriptionResult.data
      ?.plan === "pro"
    && subscriptionResult.data
      ?.status === "active";

  if (!isPro) {
    publishError(
      assistantId,
      "Website publishing requires an active Pro plan.",
    );
  }

  if (
    readySourcesResult.error
  ) {
    publishError(
      assistantId,
      "We could not check this assistant's knowledge.",
    );
  }

  if (
    (readySourcesResult.count ?? 0)
    < 1
  ) {
    publishError(
      assistantId,
      "Process at least one knowledge source before publishing.",
    );
  }

  if (
    assistantResult.data.is_published
    && assistantResult.data.status
      === "ready"
  ) {
    redirect(
      installUrl(
        assistantId,
        "success",
        "This assistant is already published.",
      ),
    );
  }

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("assistants")
    .update({
      is_published: true,
      status: "ready",
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
      "id,is_published,status",
    )
    .maybeSingle();

  if (
    updateError
    || !updated
    || !updated.is_published
    || updated.status
      !== "ready"
  ) {
    console.error(
      "ASSISTANT_PUBLISH_FAILED",
      {
        assistantId,
        code:
          updateError?.code
          ?? null,
        message:
          updateError?.message
          ?? "Unexpected publish result",
      },
    );

    publishError(
      assistantId,
      "We could not publish this assistant. Please try again.",
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
    installUrl(
      assistantId,
      "success",
      "Assistant published. It is ready for website setup.",
    ),
  );
}
