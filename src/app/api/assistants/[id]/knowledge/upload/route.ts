import {
  revalidatePath,
} from "next/cache";
import {
  NextResponse,
} from "next/server";

import {
  getServerDictionary,
} from "@/i18n/server";
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

  const copy =
    (
      await getServerDictionary()
    ).dashboard.knowledge;

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
      copy.errors.uploadReadFailed,
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
      copy.errors.chooseUpload,
    );
  }

  const validationError =
    validateKnowledgeFile(
      candidate,
      {
        empty:
          copy.errors.fileEmpty,
        tooLarge:
          copy.errors.fileTooLarge,
        unsupported:
          copy.errors.unsupportedFile,
      },
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
      copy.errors.accountLimitCheckFailed,
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
        ? copy.errors.freeLimit
        : copy.errors.proLimit,
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
      copy.errors.storeFailed,
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
      || copy.defaultDocumentTitle;

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
      copy.errors.registerFailed,
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
    copy.errors.documentUploaded,
  );
}
