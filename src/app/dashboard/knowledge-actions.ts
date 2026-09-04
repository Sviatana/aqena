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
  KNOWLEDGE_BUCKET,
  isUuid,
  knowledgeSourceLimit,
} from "@/lib/knowledge";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";

function textValue(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function knowledgeUrl(
  assistantId: string,
  key: "error" | "success",
  message: string,
) {
  return (
    `/dashboard/assistants/${assistantId}`
    + `?${key}=${encodeURIComponent(message)}`
  );
}

function knowledgeError(
  assistantId: string,
  message: string,
): never {
  redirect(
    knowledgeUrl(
      assistantId,
      "error",
      message,
    ),
  );
}

export async function createTextKnowledgeSource(
  assistantId: string,
  formData: FormData,
) {
  if (!isUuid(assistantId)) {
    redirect("/dashboard");
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
    redirect("/auth/login");
  }

  const title =
    textValue(
      formData,
      "title",
    );

  const content =
    textValue(
      formData,
      "content",
    );

  if (!title) {
    knowledgeError(
      assistantId,
      copy.errors.titleRequired,
    );
  }

  if (title.length > 120) {
    knowledgeError(
      assistantId,
      copy.errors.titleTooLong,
    );
  }

  if (!content) {
    knowledgeError(
      assistantId,
      copy.errors.contentRequired,
    );
  }

  if (content.length > 100_000) {
    knowledgeError(
      assistantId,
      copy.errors.contentTooLong,
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
    redirect("/dashboard");
  }

  if (subscriptionResult.error) {
    knowledgeError(
      assistantId,
      copy.errors.planCheckFailed,
    );
  }

  if (countResult.error) {
    knowledgeError(
      assistantId,
      copy.errors.sourceLimitCheckFailed,
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
    knowledgeError(
      assistantId,
      plan === "free"
        ? copy.errors.freeLimit
        : copy.errors.proLimit,
    );
  }

  const sizeBytes =
    new TextEncoder()
      .encode(content)
      .byteLength;

  const {
    error: insertError,
  } = await supabase
    .from("knowledge_sources")
    .insert({
      assistant_id: assistantId,
      source_type: "text",
      title,
      mime_type: "text/plain",
      size_bytes: sizeBytes,
      content_text: content,
      status: "pending",
    });

  if (insertError) {
    knowledgeError(
      assistantId,
      copy.errors.addFailed,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  redirect(
    knowledgeUrl(
      assistantId,
      "success",
      copy.errors.textAdded,
    ),
  );
}

export async function deleteKnowledgeSource(
  assistantId: string,
  sourceId: string,
) {
  if (
    !isUuid(assistantId)
    || !isUuid(sourceId)
  ) {
    redirect("/dashboard");
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

  if (
    claimsError
    || !claimsData?.claims?.sub
  ) {
    redirect("/auth/login");
  }

  const {
    data: source,
    error: sourceError,
  } = await supabase
    .from("knowledge_sources")
    .select(
      "id,storage_path",
    )
    .eq("id", sourceId)
    .eq(
      "assistant_id",
      assistantId,
    )
    .maybeSingle();

  if (
    sourceError
    || !source
  ) {
    knowledgeError(
      assistantId,
      copy.errors.unavailable,
    );
  }

  if (source.storage_path) {
    const admin =
      createAdminClient();

    const {
      error: storageError,
    } = await admin
      .storage
      .from(KNOWLEDGE_BUCKET)
      .remove([
        source.storage_path,
      ]);

    if (storageError) {
      knowledgeError(
        assistantId,
        copy.errors.removeStoredFailed,
      );
    }
  }

  const {
    error: deleteError,
  } = await supabase
    .from("knowledge_sources")
    .delete()
    .eq("id", sourceId)
    .eq(
      "assistant_id",
      assistantId,
    );

  if (deleteError) {
    knowledgeError(
      assistantId,
      copy.errors.removeFailed,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  redirect(
    knowledgeUrl(
      assistantId,
      "success",
      copy.errors.removed,
    ),
  );
}

export async function processKnowledgeSource(
  assistantId: string,
  sourceId: string,
) {
  if (
    !isUuid(assistantId)
    || !isUuid(sourceId)
  ) {
    redirect("/dashboard");
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
    redirect("/auth/login");
  }

  const {
    data: assistant,
    error: assistantError,
  } = await supabase
    .from("assistants")
    .select("id")
    .eq("id", assistantId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (
    assistantError
    || !assistant
  ) {
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  const {
    data: source,
    error: sourceError,
  } = await admin
    .from("knowledge_sources")
    .select(
      "id,assistant_id,source_type,title,original_file_name,storage_path,mime_type,content_text,status",
    )
    .eq("id", sourceId)
    .eq(
      "assistant_id",
      assistantId,
    )
    .maybeSingle();

  if (
    sourceError
    || !source
  ) {
    knowledgeError(
      assistantId,
      copy.errors.unavailable,
    );
  }

  if (
    source.status === "processing"
  ) {
    knowledgeError(
      assistantId,
      copy.errors.alreadyProcessing,
    );
  }

  await admin
    .from("knowledge_sources")
    .update({
      status: "processing",
      error_message: null,
    })
    .eq("id", sourceId);

  revalidatePath(
    `/dashboard/assistants/${assistantId}`,
  );

  let processedChunkCount = 0;

  try {
    let content = "";

    if (
      source.source_type === "text"
    ) {
      content =
        source.content_text
        ?? "";
    } else {
      if (!source.storage_path) {
        throw new Error(
          "Stored document path is missing",
        );
      }

      const lowerFileName =
        source.original_file_name
          ?.toLowerCase()
        ?? "";

      const isPdf =
        source.mime_type
          === "application/pdf"
        || lowerFileName
          .endsWith(".pdf");

      const isTextDocument =
        source.mime_type
          === "text/plain"
        || source.mime_type
          === "text/markdown"
        || lowerFileName
          .endsWith(".txt")
        || lowerFileName
          .endsWith(".md");

      if (
        !isPdf
        && !isTextDocument
      ) {
        throw new Error(
          "Unsupported knowledge document type",
        );
      }

      const {
        data: file,
        error: downloadError,
      } = await admin
        .storage
        .from(KNOWLEDGE_BUCKET)
        .download(
          source.storage_path,
        );

      if (
        downloadError
        || !file
      ) {
        throw new Error(
          downloadError?.message
          || "Stored document could not be downloaded",
        );
      }

      if (isPdf) {
        const {
          extractPdfText,
        } = await import(
          "@/lib/pdf"
        );

        const extracted =
          await extractPdfText(
            file,
          );

        content =
          extracted.text;
      } else {
        content =
          await file.text();
      }
    }

    content =
      content.trim();

    if (!content) {
      throw new Error(
        "Knowledge source contains no readable text",
      );
    }

    const {
      chunkKnowledgeText,
    } = await import(
      "@/lib/rag/chunk"
    );

    const chunks =
      chunkKnowledgeText(
        content,
      );

    if (!chunks.length) {
      throw new Error(
        "No chunks were produced",
      );
    }

    const {
      embedDocuments,
      toVectorLiteral,
    } = await import(
      "@/lib/openrouter"
    );

    const embeddings =
      await embedDocuments(
        chunks.map(
          (chunk) =>
            chunk.content,
        ),
      );

    if (
      embeddings.length
      !== chunks.length
    ) {
      throw new Error(
        "Embedding count does not match chunk count",
      );
    }

    const {
      error: clearError,
    } = await admin
      .from("knowledge_chunks")
      .delete()
      .eq(
        "assistant_id",
        assistantId,
      )
      .eq(
        "source_id",
        sourceId,
      );

    if (clearError) {
      throw new Error(
        clearError.message,
      );
    }

    const rows =
      chunks.map(
        (chunk, index) => ({
          assistant_id:
            assistantId,
          source_id:
            sourceId,
          chunk_index:
            index,
          content:
            chunk.content,
          token_count:
            chunk.tokenCount,
          metadata: {
            source_title:
              source.title,
            source_type:
              source.source_type,
            original_file_name:
              source.original_file_name,
          },
          embedding:
            toVectorLiteral(
              embeddings[index],
            ),
        }),
      );

    const {
      error: insertError,
    } = await admin
      .from("knowledge_chunks")
      .insert(rows);

    if (insertError) {
      throw new Error(
        insertError.message,
      );
    }

    const {
      error: readyError,
    } = await admin
      .from("knowledge_sources")
      .update({
        status: "ready",
        error_message: null,
        content_text:
          source.source_type === "file"
            ? content
            : source.content_text,
      })
      .eq("id", sourceId);

    if (readyError) {
      throw new Error(
        readyError.message,
      );
    }

    revalidatePath("/dashboard");
    revalidatePath(
      `/dashboard/assistants/${assistantId}`,
    );

    processedChunkCount =
      chunks.length;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown ingestion error";

    console.error(
      "KNOWLEDGE_PROCESSING_FAILED",
      {
        assistantId,
        sourceId,
        message,
      },
    );

    await admin
      .from("knowledge_sources")
      .update({
        status: "failed",
        error_message:
          message.includes(
            "does not contain readable text",
          )
            ? "pdf_unreadable"
            : message.includes(
                "can contain up to",
              )
              ? "source_too_large"
              : message.includes(
                  "processing took too long",
                )
                ? "pdf_timeout"
                : "processing_failed",
      })
      .eq("id", sourceId);

    revalidatePath(
      `/dashboard/assistants/${assistantId}`,
    );

    return knowledgeError(
      assistantId,
      copy.errors.processFailed,
    );
  }

  redirect(
    knowledgeUrl(
      assistantId,
      "success",
      copy.errors.processedTemplate.replace(
        "{count}",
        String(processedChunkCount),
      ),
    ),
  );
}
