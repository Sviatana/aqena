-- Persist one complete Playground exchange atomically.
--
-- RAG generation happens before this function.
-- Only a successfully generated answer reaches this transaction.
--
-- The function:
-- 1. verifies the authenticated user owns the assistant;
-- 2. verifies the Playground conversation belongs to that user;
-- 3. locks monthly usage;
-- 4. checks the plan limit;
-- 5. inserts both user and assistant messages;
-- 6. increments usage;
-- 7. updates conversation activity.
--
-- Either all database changes succeed or none do.

create or replace function
  public.commit_playground_exchange(
    p_assistant_id uuid,
    p_conversation_id uuid,
    p_user_content text,
    p_assistant_content text,
    p_citations jsonb,
    p_input_tokens integer,
    p_output_tokens integer
  )
returns table (
  allowed boolean,
  plan_name text,
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
  v_user_id uuid;
  v_plan text;
  v_limit integer;
  v_month date;
  v_message_count integer;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
begin
  v_user_id :=
    auth.uid();

  if v_user_id is null then
    raise exception
      'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.assistants as a
    where
      a.id = p_assistant_id
      and a.owner_id = v_user_id
  ) then
    raise exception
      'assistant_not_found';
  end if;

  if not exists (
    select 1
    from public.conversations as c
    where
      c.id = p_conversation_id
      and c.assistant_id = p_assistant_id
      and c.user_id = v_user_id
      and c.channel = 'playground'
  ) then
    raise exception
      'conversation_not_found';
  end if;

  if
    nullif(
      btrim(p_user_content),
      ''
    ) is null
  then
    raise exception
      'empty_user_message';
  end if;

  if
    nullif(
      btrim(p_assistant_content),
      ''
    ) is null
  then
    raise exception
      'empty_assistant_message';
  end if;

  select
    case
      when
        s.plan = 'pro'
        and s.status = 'active'
      then 'pro'
      else 'free'
    end
  into v_plan
  from public.subscriptions as s
  where
    s.user_id = v_user_id;

  v_plan :=
    coalesce(
      v_plan,
      'free'
    );

  v_limit :=
    case
      when v_plan = 'pro'
      then 2000
      else 50
    end;

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
    v_user_id,
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
  into v_message_count
  from public.usage_monthly as u
  where
    u.user_id = v_user_id
    and u.month = v_month
  for update;

  if
    v_message_count
    >= v_limit
  then
    return query
    select
      false,
      v_plan,
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
    btrim(p_user_content),
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
    btrim(p_assistant_content),
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

    playground_message_count =
      u.playground_message_count + 1

  where
    u.user_id = v_user_id
    and u.month = v_month

  returning
    u.message_count
  into v_message_count;

  update public.conversations as c
  set
    updated_at = now()
  where
    c.id = p_conversation_id;

  return query
  select
    true,
    v_plan,
    v_limit,
    v_message_count,
    v_user_message_id,
    v_assistant_message_id;
end;
$$;


revoke all
on function public.commit_playground_exchange(
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
on function public.commit_playground_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
from anon;

grant execute
on function public.commit_playground_exchange(
  uuid,
  uuid,
  text,
  text,
  jsonb,
  integer,
  integer
)
to authenticated;


-- The previous reservation-style function is no longer
-- used once atomic commit is enabled.

drop function if exists
  public.consume_playground_message(
    uuid
  );
