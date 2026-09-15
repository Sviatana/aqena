-- Platform-owner manual Pro operations.
--
-- Payment is NOT processed by AQENA.
-- The platform owner confirms external payment manually.
--
-- Activation is atomic:
--   1. lock and validate the billing request;
--   2. activate the user's Pro subscription;
--   3. close the billing request as activated.
--
-- If any step fails, PostgreSQL rolls back the whole function call.

create or replace function public.activate_manual_pro_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_request_status text;
begin
  select
    request.user_id,
    request.status
  into
    v_user_id,
    v_request_status
  from public.billing_requests as request
  where request.id = p_request_id
  for update;

  if v_user_id is null then
    raise exception
      'manual billing request not found';
  end if;

  -- Idempotent retry protection.
  if v_request_status = 'activated' then
    return;
  end if;

  if v_request_status not in (
    'pending',
    'contacted',
    'paid'
  ) then
    raise exception
      'manual billing request is not open';
  end if;

  update public.subscriptions
  set
    plan = 'pro',
    status = 'active',
    billing_mode = 'manual',
    mock_checkout_completed_at = null,
    updated_at = now()
  where user_id = v_user_id;

  if not found then
    raise exception
      'subscription not found for billing request';
  end if;

  update public.billing_requests
  set
    status = 'activated',
    updated_at = now()
  where id = p_request_id;
end;
$$;

revoke all
on function public.activate_manual_pro_request(uuid)
from public;

revoke all
on function public.activate_manual_pro_request(uuid)
from anon;

revoke all
on function public.activate_manual_pro_request(uuid)
from authenticated;

grant execute
on function public.activate_manual_pro_request(uuid)
to service_role;


-- Cancelling a request never modifies the user's subscription.

create or replace function public.cancel_manual_pro_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_request_status text;
begin
  select
    request.user_id,
    request.status
  into
    v_user_id,
    v_request_status
  from public.billing_requests as request
  where request.id = p_request_id
  for update;

  if v_user_id is null then
    raise exception
      'manual billing request not found';
  end if;

  -- Idempotent retry protection.
  if v_request_status = 'cancelled' then
    return;
  end if;

  if v_request_status not in (
    'pending',
    'contacted',
    'paid'
  ) then
    raise exception
      'manual billing request is not open';
  end if;

  update public.billing_requests
  set
    status = 'cancelled',
    updated_at = now()
  where id = p_request_id;
end;
$$;

revoke all
on function public.cancel_manual_pro_request(uuid)
from public;

revoke all
on function public.cancel_manual_pro_request(uuid)
from anon;

revoke all
on function public.cancel_manual_pro_request(uuid)
from authenticated;

grant execute
on function public.cancel_manual_pro_request(uuid)
to service_role;
