"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  getServerDictionary,
} from "@/i18n/server";

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

  const copy =
    (
      await getServerDictionary()
    ).dashboard.install;

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
      copy.errors.planCheckFailed,
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
      copy.errors.proRequired,
    );
  }

  if (
    readySourcesResult.error
  ) {
    publishError(
      assistantId,
      copy.errors.knowledgeCheckFailed,
    );
  }

  if (
    (readySourcesResult.count ?? 0)
    < 1
  ) {
    publishError(
      assistantId,
      copy.errors.knowledgeRequired,
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
        copy.errors.alreadyPublished,
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
      copy.errors.publishFailed,
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
      copy.errors.publishedSuccess,
    ),
  );
}

export async function unpublishAssistant(
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
    redirect("/dashboard");
  }

  const copy =
    (
      await getServerDictionary()
    ).dashboard.selfService;

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

  const {
    data: assistant,
    error: assistantError,
  } = await supabase
    .from("assistants")
    .select(
      "id,is_published",
    )
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
    !assistant.is_published
  ) {
    redirect(
      installUrl(
        assistantId,
        "success",
        copy.alreadyUnpublished,
      ),
    );
  }

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("assistants")
    .update({
      is_published: false,
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
      "id,is_published",
    )
    .maybeSingle();

  if (
    updateError
    || !updated
    || updated.is_published
  ) {
    console.error(
      "ASSISTANT_UNPUBLISH_FAILED",
      {
        assistantId,
        code:
          updateError?.code
          ?? null,
        message:
          updateError?.message
          ?? "Unexpected unpublish result",
      },
    );

    redirect(
      installUrl(
        assistantId,
        "error",
        copy.unpublishFailed,
      ),
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
      copy.unpublishedSuccess,
    ),
  );
}
