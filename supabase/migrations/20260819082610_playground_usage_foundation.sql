-- Anvera Playground foundation.
--
-- One authenticated Playground conversation per
-- assistant/user pair.
--
-- Monthly usage is incremented atomically inside
-- a narrowly scoped security-definer function.
-- Direct authenticated writes to usage_monthly
-- remain disabled.

create unique index if not exists
  conversations_assistant_user_channel_uidx
on public.conversations (
  assistant_id,
  user_id,
  channel
);


create or replace function
  public.consume_playground_message(
    p_assistant_id uuid
  )
returns table (
  allowed boolean,
  plan_name text,
  message_limit integer,
  messages_used integer
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
  where s.user_id = v_user_id;

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
      v_message_count;

    return;
  end if;

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

  return query
  select
    true,
    v_plan,
    v_limit,
    v_message_count;
end;
$$;


revoke all
on function public.consume_playground_message(
  uuid
)
from public;

revoke all
on function public.consume_playground_message(
  uuid
)
from anon;

grant execute
on function public.consume_playground_message(
  uuid
)
to authenticated;
