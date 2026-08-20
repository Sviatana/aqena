import "server-only";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  embedQuery,
  toVectorLiteral,
} from "@/lib/openrouter";
import {
  ragConfig,
} from "@/lib/rag/config";
import type {
  Database,
} from "@/types/database";

export type RetrievedKnowledgeChunk = {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  content: string;
  metadata:
    Database["public"]["Tables"]["knowledge_chunks"]["Row"]["metadata"];
  similarity: number;
};

export async function retrieveKnowledge(
  supabase: SupabaseClient<Database>,
  assistantId: string,
  question: string,
): Promise<RetrievedKnowledgeChunk[]> {
  const queryEmbedding =
    await embedQuery(
      question,
    );

  const config =
    ragConfig();

  const {
    data,
    error,
  } = await supabase.rpc(
    "match_knowledge_chunks",
    {
      p_assistant_id:
        assistantId,
      p_query_embedding:
        toVectorLiteral(
          queryEmbedding,
        ),
      p_match_threshold:
        config.minSimilarity,
      p_match_count:
        config.topK,
    },
  );

  if (error) {
    throw new Error(
      `Knowledge retrieval failed: ${error.message}`,
    );
  }

  return (data ?? []).map(
    (row) => ({
      chunkId:
        row.chunk_id,
      sourceId:
        row.source_id,
      sourceTitle:
        row.source_title,
      content:
        row.content,
      metadata:
        row.metadata,
      similarity:
        row.similarity,
    }),
  );
}


export async function retrievePublicKnowledge(
  supabase: SupabaseClient<Database>,
  publicId: string,
  question: string,
): Promise<RetrievedKnowledgeChunk[]> {
  const queryEmbedding =
    await embedQuery(
      question,
    );

  const config =
    ragConfig();

  const {
    data,
    error,
  } = await supabase.rpc(
    "match_public_knowledge_chunks",
    {
      p_public_id:
        publicId,

      p_query_embedding:
        toVectorLiteral(
          queryEmbedding,
        ),

      p_match_threshold:
        config.minSimilarity,

      p_match_count:
        config.topK,
    },
  );

  if (error) {
    throw new Error(
      `Public knowledge retrieval failed: ${error.message}`,
    );
  }

  return (data ?? []).map(
    (row) => ({
      chunkId:
        row.chunk_id,

      sourceId:
        row.source_id,

      sourceTitle:
        row.source_title,

      content:
        row.content,

      metadata:
        row.metadata,

      similarity:
        row.similarity,
    }),
  );
}
