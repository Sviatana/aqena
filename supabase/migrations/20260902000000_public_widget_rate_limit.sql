-- =========================================================
-- AQENA public widget abuse protection
-- =========================================================
--
-- The application hashes:
--
--   public_id + ":" + CF-Connecting-IP
--
-- before calling this RPC.
--
-- Raw client IP addresses are never stored here.
--
-- Fixed-window policy:
-- - 20 requests
-- - per 60 seconds
-- - per assistant public id + client IP
--
-- The RPC is intentionally available only to service_role.
-- Anonymous/authenticated clients cannot access the table
-- or consume the limiter directly.
-- =========================================================

create table public.widget_rate_limits (
  key_hash text primary key
    check (
      key_hash ~ '^[0-9a-f]{64}$'
    ),

  window_started_at timestamptz
    not null default now(),

  request_count integer
    not null default 0
    check (
      request_count >= 0
    ),

  updated_at timestamptz
    not null default now()
);


alter table public.widget_rate_limits
enable row level security;


revoke all
on table public.widget_rate_limits
from public;

revoke all
on table public.widget_rate_limits
from anon;

revoke all
on table public.widget_rate_limits
from authenticated;


create or replace function
  public.consume_widget_rate_limit(
    p_key_hash text
  )
returns table (
  allowed boolean,
  retry_after_seconds integer,
  requests_used integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz :=
    clock_timestamp();

  v_window interval :=
    interval '60 seconds';

  v_limit integer :=
    20;

  v_window_started_at timestamptz;
  v_request_count integer;
begin
  if
    p_key_hash is null
    or p_key_hash
      !~ '^[0-9a-f]{64}$'
  then
    raise exception
      'invalid_rate_limit_key';
  end if;


  insert into public.widget_rate_limits as current_limit (
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_key_hash,
    v_now,
    1,
    v_now
  )

  on conflict (
    key_hash
  )
  do update
  set
    window_started_at =
      case
        when
          current_limit.window_started_at
          <= v_now - v_window
        then
          v_now
        else
          current_limit.window_started_at
      end,

    request_count =
      case
        when
          current_limit.window_started_at
          <= v_now - v_window
        then
          1
        else
          least(
            current_limit.request_count + 1,
            v_limit + 1
          )
      end,

    updated_at =
      v_now

  returning
    current_limit.window_started_at,
    current_limit.request_count
  into
    v_window_started_at,
    v_request_count;


  return query
  select
    v_request_count <= v_limit,

    case
      when
        v_request_count <= v_limit
      then
        0
      else
        greatest(
          1,
          ceil(
            extract(
              epoch from (
                v_window_started_at
                + v_window
                - v_now
              )
            )
          )::integer
        )
    end,

    v_request_count;
end;
$$;


revoke all
on function public.consume_widget_rate_limit(
  text
)
from public;

revoke all
on function public.consume_widget_rate_limit(
  text
)
from anon;

revoke all
on function public.consume_widget_rate_limit(
  text
)
from authenticated;


grant execute
on function public.consume_widget_rate_limit(
  text
)
to service_role;
