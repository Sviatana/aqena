-- AQENA RAG vector foundation.
--
-- OpenRouter:
--   qwen/qwen3-embedding-8b
--   dimensions = 1536
--
-- Search metric:
--   cosine similarity

do $$
begin
  if exists (
    select 1
    from public.knowledge_chunks
    where embedding is not null
  ) then
    raise exception
      'knowledge_chunks already contains embeddings; verify dimensions before migration';
  end if;
end
$$;


alter table public.knowledge_chunks
  alter column embedding
  type extensions.vector(1536)
  using embedding::extensions.vector(1536);


create index if not exists
  knowledge_chunks_embedding_hnsw_idx
on public.knowledge_chunks
using hnsw (
  embedding extensions.vector_cosine_ops
);


create or replace function
  public.match_knowledge_chunks(
    p_assistant_id uuid,
    p_query_embedding extensions.vector(1536),
    p_match_threshold double precision default 0.55,
    p_match_count integer default 5
  )
returns table (
  chunk_id uuid,
  source_id uuid,
  source_title text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    kc.id as chunk_id,
    kc.source_id,
    ks.title as source_title,
    kc.content,
    kc.metadata,
    1 - (
      kc.embedding
      <=> p_query_embedding
    ) as similarity
  from public.knowledge_chunks as kc
  join public.knowledge_sources as ks
    on ks.id = kc.source_id
    and ks.assistant_id = kc.assistant_id
  where
    kc.assistant_id = p_assistant_id
    and kc.embedding is not null
    and exists (
      select 1
      from public.assistants as a
      where
        a.id = p_assistant_id
        and a.owner_id =
          (select auth.uid())
    )
    and (
      1 - (
        kc.embedding
        <=> p_query_embedding
      )
    ) >= p_match_threshold
  order by
    kc.embedding
    <=> p_query_embedding
  limit least(
    greatest(
      p_match_count,
      1
    ),
    20
  );
$$;


revoke all
on function public.match_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
from public;


grant execute
on function public.match_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
to authenticated;
