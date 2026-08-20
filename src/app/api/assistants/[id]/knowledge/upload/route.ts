import {
  revalidatePath,
} from "next/cache";
import {
  NextResponse,
} from "next/server";

import {
  KNOWLEDGE_BUCKET,
  isUuid,
  knowledgeSourceLimit,
  safeStorageFileName,
  validateKnowledgeFile,
} from "@/lib/knowledge";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function redirectTo(
  request: Request,
  path: string,
) {
  return NextResponse.redirect(
    new URL(
      path,
      request.url,
    ),
    303,
  );
}

function knowledgeRedirect(
  request: Request,
  assistantId: string,
  key: "error" | "success",
  message: string,
) {
  return redirectTo(
    request,
    (
      `/dashboard/assistants/${assistantId}`
      + `?${key}=${encodeURIComponent(message)}`
    ),
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const {
    id: assistantId,
  } = await context.params;

  if (!isUuid(assistantId)) {
    return redirectTo(
      request,
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
    return redirectTo(
      request,
      "/auth/login",
    );
  }

  let formData: FormData;

  try {
    formData =
      await request.formData();
  } catch {
    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      "We could not read this upload. Please try again.",
    );
  }

  const candidate =
    formData.get("file");

  if (
    !(candidate instanceof File)
  ) {
    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      "Choose a document to upload.",
    );
  }

  const validationError =
    validateKnowledgeFile(
      candidate,
    );

  if (validationError) {
    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      validationError,
    );
  }

  const [
    assistantResult,
    subscriptionResult,
    countResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select("id")
      .eq("id", assistantId)
      .eq("owner_id", userId)
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("knowledge_sources")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),
  ]);

  if (
    assistantResult.error
    || !assistantResult.data
  ) {
    return redirectTo(
      request,
      "/dashboard",
    );
  }

  if (
    subscriptionResult.error
    || countResult.error
  ) {
    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      "We could not check your account limits. Please try again.",
    );
  }

  const plan =
    subscriptionResult.data?.plan
      === "pro"
      ? "pro"
      : "free";

  const limit =
    knowledgeSourceLimit(plan);

  if (
    (countResult.count ?? 0)
    >= limit
  ) {
    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      plan === "free"
        ? "The Free plan includes three knowledge sources. Upgrade to Pro to add more."
        : "Your Pro plan includes up to 100 knowledge sources.",
    );
  }

  const sourceId =
    crypto.randomUUID();

  const storedName =
    safeStorageFileName(
      candidate.name,
    );

  const storagePath =
    [
      userId,
      assistantId,
      sourceId,
      storedName,
    ].join("/");

  const admin =
    createAdminClient();

  const {
    error: uploadError,
  } = await admin
    .storage
    .from(KNOWLEDGE_BUCKET)
    .upload(
      storagePath,
      candidate,
      {
        contentType:
          candidate.type,
        upsert: false,
      },
    );

  if (uploadError) {
    console.error(
      "KNOWLEDGE_UPLOAD_FAILED",
      {
        message:
          uploadError.message,
      },
    );

    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      "We could not store this document. Please try again.",
    );
  }

  const title =
    candidate.name
      .replace(
        /\.[^.]+$/,
        "",
      )
      .trim()
      .slice(0, 120)
      || "Document";

  const {
    error: insertError,
  } = await supabase
    .from("knowledge_sources")
    .insert({
      id: sourceId,
      assistant_id: assistantId,
      source_type: "file",
      title,
      original_file_name:
        candidate.name,
      storage_path:
        storagePath,
      mime_type:
        candidate.type,
      size_bytes:
        candidate.size,
      status: "pending",
    });

  if (insertError) {
    console.error(
      "KNOWLEDGE_SOURCE_INSERT_FAILED",
      {
        message:
          insertError.message,
      },
    );

    await admin
      .storage
      .from(KNOWLEDGE_BUCKET)
      .remove([
        storagePath,
      ]);

    return knowledgeRedirect(
      request,
      assistantId,
      "error",
      "We could not register this document. Please try again.",
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  return knowledgeRedirect(
    request,
    assistantId,
    "success",
    "Document uploaded.",
  );
}
