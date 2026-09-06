-- AQENA public widget server foundation.
--
-- Important security model:
--
-- Browsers never call these functions directly.
-- Only the AQENA server, using the service_role key,
-- can execute them.
--
-- Public visitors identify an assistant only by public_id.
-- The internal assistant id, owner id and private tables
-- remain server-side.


-- =========================================================
-- 1. PUBLIC-WIDGET RETRIEVAL
-- =========================================================
--
-- This is deliberately separate from
-- match_knowledge_chunks(), which remains restricted
-- to the authenticated assistant owner for Playground.
--
-- A widget may retrieve knowledge only when:
-- - public_id exists;
-- - assistant is published;
-- - assistant status is ready;
-- - owner has active Pro;
-- - knowledge source is ready.

create or replace function
  public.match_public_knowledge_chunks(
    p_public_id uuid,
    p_query_embedding extensions.vector(1536),
    p_match_threshold double precision default 0.40,
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
security definer
set search_path = ''
as $$
  select
    kc.id as chunk_id,
    kc.source_id,
    ks.title as source_title,
    kc.content,
    kc.metadata,
    1 - (
      kc.embedding
      OPERATOR(extensions.<=>)
      p_query_embedding
    ) as similarity

  from public.knowledge_chunks as kc

  join public.knowledge_sources as ks
    on ks.id = kc.source_id
    and ks.assistant_id =
      kc.assistant_id

  join public.assistants as a
    on a.id =
      kc.assistant_id

  join public.subscriptions as s
    on s.user_id =
      a.owner_id

  where
    a.public_id =
      p_public_id

    and a.is_published =
      true

    and a.status =
      'ready'

    and s.plan =
      'pro'

    and s.status =
      'active'

    and ks.status =
      'ready'

    and kc.embedding
      is not null

    and (
      1 - (
        kc.embedding
        OPERATOR(extensions.<=>)
        p_query_embedding
      )
    ) >= p_match_threshold

  order by
    kc.embedding
    OPERATOR(extensions.<=>)
    p_query_embedding

  limit least(
    greatest(
      p_match_count,
      1
    ),
    20
  );
$$;


revoke all
on function public.match_public_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
from public;

revoke all
on function public.match_public_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
from anon;

revoke all
on function public.match_public_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
from authenticated;

grant execute
on function public.match_public_knowledge_chunks(
  uuid,
  extensions.vector(1536),
  double precision,
  integer
)
to service_role;


-- =========================================================
-- 2. ATOMIC WIDGET EXCHANGE
-- =========================================================
--
-- RAG generation happens before this function.
--
-- If generation succeeds, one transaction:
-- - validates Published + Ready + active Pro;
-- - validates widget conversation;
-- - locks monthly usage;
-- - checks the 2,000-message Pro limit;
-- - inserts user message;
-- - inserts assistant message;
-- - increments total message count;
-- - increments widget message count;
-- - updates conversation activity.
--
-- Either all changes succeed or none do.

create or replace function
  public.commit_widget_exchange(
    p_public_id uuid,
    p_conversation_id uuid,
    p_user_content text,
    p_assistant_content text,
    p_citations jsonb,
    p_input_tokens integer,
    p_output_tokens integer
  )
returns table (
  allowed boolean,
  message_limit integer,
  messages_used integer,
  user_message_id uuid,
  assistant_message_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assistant_id uuid;
  v_owner_id uuid;
  v_limit integer := 2000;
  v_month date;
  v_message_count integer;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
begin
  select
    a.id,
    a.owner_id
  into
    v_assistant_id,
    v_owner_id
  from public.assistants as a

  join public.subscriptions as s
    on s.user_id =
      a.owner_id

  where
    a.public_id =
      p_public_id

    and a.is_published =
      true

    and a.status =
      'ready'

    and s.plan =
      'pro'

    and s.status =
      'active';

  if
    v_assistant_id is null
    or v_owner_id is null
  then
    raise exception
      'assistant_unavailable';
  end if;

  if not exists (
    select 1
    from public.conversations as c
    where
      c.id =
        p_conversation_id

      and c.assistant_id =
        v_assistant_id

      and c.channel =
        'widget'

      and c.user_id
        is null
  ) then
    raise exception
      'widget_conversation_not_found';
  end if;

  if
    nullif(
      btrim(
        p_user_content
      ),
      ''
    ) is null
  then
    raise exception
      'empty_user_message';
  end if;

  if
    nullif(
      btrim(
        p_assistant_content
      ),
      ''
    ) is null
  then
    raise exception
      'empty_assistant_message';
  end if;

  v_month :=
    date_trunc(
      'month',
      now()
    )::date;

  insert into public.usage_monthly (
    user_id,
    month,
    message_count,
    playground_message_count,
    widget_message_count
  )
  values (
    v_owner_id,
    v_month,
    0,
    0,
    0
  )
  on conflict (
    user_id,
    month
  )
  do nothing;

  select
    u.message_count
  into
    v_message_count
  from public.usage_monthly as u
  where
    u.user_id =
      v_owner_id

    and u.month =
      v_month

  for update;

  if
    v_message_count
    >= v_limit
  then
    return query
    select
      false,
      v_limit,
      v_message_count,
      null::uuid,
      null::uuid;

    return;
  end if;

  insert into public.messages (
    conversation_id,
    role,
    content,
    citations
  )
  values (
    p_conversation_id,
    'user',
    btrim(
      p_user_content
    ),
    '[]'::jsonb
  )
  returning id
  into v_user_message_id;

  insert into public.messages (
    conversation_id,
    role,
    content,
    citations,
    input_tokens,
    output_tokens
  )
  values (
    p_conversation_id,
    'assistant',
    btrim(
      p_assistant_content
    ),
    coalesce(
      p_citations,
      '[]'::jsonb
    ),
    p_input_tokens,
    p_output_tokens
  )
  returning id
  into v_assistant_message_id;

  update public.usage_monthly as u
  set
    message_count =
      u.message_count + 1,

    widget_message_count =
      u.widget_message_count + 1

  where
    u.user_id =
      v_owner_id

    and u.month =
      v_month

  returning
    u.message_count
  into
    v_message_count;

  update public.conversations as c
  set
    updated_at =
      now()
  where
    c.id =
      p_conversation_id;

  return query
  select
    true,
    v_limit,
    v_message_count,
    v_user_message_id,
    v_assistant_message_id;
end;
$$;


revoke all
on function public.commit_widget_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
from public;

revoke all
on function public.commit_widget_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
from anon;

revoke all
on function public.commit_widget_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
from authenticated;

grant execute
on function public.commit_widget_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
to service_role;
