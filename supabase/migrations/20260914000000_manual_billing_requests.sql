-- Manual Pro billing requests.
--
-- The customer submits contact details.
-- No payment is processed by AQENA.
-- Pro access is activated separately after payment confirmation.

alter table public.subscriptions
drop constraint if exists subscriptions_billing_mode_check;

alter table public.subscriptions
add constraint subscriptions_billing_mode_check
check (
  billing_mode in (
    'mock',
    'stripe',
    'manual'
  )
);

create table public.billing_requests (
  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  assistant_id uuid
    references public.assistants(id)
    on delete set null,

  requested_plan text not null
    default 'pro'
    check (
      requested_plan = 'pro'
    ),

  status text not null
    default 'pending'
    check (
      status in (
        'pending',
        'contacted',
        'paid',
        'activated',
        'cancelled'
      )
    ),

  pricing_region text not null
    check (
      pricing_region in (
        'by',
        'ru',
        'intl'
      )
    ),

  currency text not null
    check (
      currency in (
        'BYN',
        'RUB',
        'USD'
      )
    ),

  promo_amount_minor integer not null
    check (
      promo_amount_minor > 0
    ),

  standard_amount_minor integer not null
    check (
      standard_amount_minor > 0
    ),

  price_lock_months integer not null
    default 12
    check (
      price_lock_months = 12
    ),

  offer_code text not null
    default 'launch_first_100',

  customer_name text not null
    check (
      char_length(customer_name)
      between 1 and 120
    ),

  company_name text
    check (
      company_name is null
      or char_length(company_name) <= 160
    ),

  email text not null
    check (
      char_length(email)
      between 3 and 320
    ),

  contact_method text not null
    check (
      contact_method in (
        'telegram',
        'phone'
      )
    ),

  contact_value text not null
    check (
      char_length(contact_value)
      between 2 and 160
    ),

  note text
    check (
      note is null
      or char_length(note) <= 1000
    ),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

create unique index
billing_requests_one_open_per_user
on public.billing_requests (user_id)
where status in (
  'pending',
  'contacted',
  'paid'
);

create trigger billing_requests_set_updated_at
before update on public.billing_requests
for each row
execute function public.set_updated_at();

-- Explicit Data API privileges.
--
-- The browser may only read the signed-in user's own request.
-- Request creation happens server-side through service_role.
-- Anonymous visitors receive no table privileges.
revoke all
on table public.billing_requests
from anon, authenticated, service_role;

grant select
on table public.billing_requests
to authenticated;

grant select, insert
on table public.billing_requests
to service_role;

alter table public.billing_requests
enable row level security;

create policy "billing_requests_select_own"
on public.billing_requests
for select
to authenticated
using (
  user_id = (
    select auth.uid()
  )
);
