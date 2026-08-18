create extension if not exists vector
with schema extensions;


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.assistants (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references auth.users(id)
    on delete cascade,

  public_id uuid not null
    default gen_random_uuid()
    unique,

  name text not null
    check (
      char_length(trim(name)) between 1 and 80
    ),

  description text not null default '',

  instructions text not null default
    'Answer only using the provided company knowledge. If the answer is not supported by the knowledge, clearly say that you could not find it.',

  welcome_message text not null default
    'Hi — ask me anything about our company knowledge.',

  fallback_message text not null default
    'I could not find that in the available company knowledge.',

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'ready',
        'archived'
      )
    ),

  is_published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),

  assistant_id uuid not null
    references public.assistants(id)
    on delete cascade,

  source_type text not null
    check (
      source_type in (
        'file',
        'text'
      )
    ),

  title text not null,

  original_file_name text,

  storage_path text,

  mime_type text,

  size_bytes bigint
    check (
      size_bytes is null
      or size_bytes >= 0
    ),

  content_text text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'processing',
        'ready',
        'failed'
      )
    ),

  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint knowledge_sources_id_assistant_unique
    unique (id, assistant_id)
);


create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),

  assistant_id uuid not null,

  source_id uuid not null,

  chunk_index integer not null
    check (
      chunk_index >= 0
    ),

  content text not null,

  token_count integer
    check (
      token_count is null
      or token_count >= 0
    ),

  metadata jsonb not null
    default '{}'::jsonb,

  embedding extensions.vector,

  created_at timestamptz not null default now(),

  constraint knowledge_chunks_source_assistant_fk
    foreign key (
      source_id,
      assistant_id
    )
    references public.knowledge_sources (
      id,
      assistant_id
    )
    on delete cascade,

  constraint knowledge_chunks_source_index_unique
    unique (
      source_id,
      chunk_index
    )
);


create table public.conversations (
  id uuid primary key default gen_random_uuid(),

  assistant_id uuid not null
    references public.assistants(id)
    on delete cascade,

  user_id uuid
    references auth.users(id)
    on delete set null,

  channel text not null default 'playground'
    check (
      channel in (
        'playground',
        'widget'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.conversations(id)
    on delete cascade,

  role text not null
    check (
      role in (
        'user',
        'assistant',
        'system'
      )
    ),

  content text not null,

  citations jsonb not null
    default '[]'::jsonb,

  input_tokens integer
    check (
      input_tokens is null
      or input_tokens >= 0
    ),

  output_tokens integer
    check (
      output_tokens is null
      or output_tokens >= 0
    ),

  created_at timestamptz not null default now()
);


create table public.subscriptions (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  plan text not null default 'free'
    check (
      plan in (
        'free',
        'pro'
      )
    ),

  status text not null default 'active'
    check (
      status in (
        'active',
        'canceled'
      )
    ),

  billing_mode text not null default 'mock'
    check (
      billing_mode in (
        'mock',
        'stripe'
      )
    ),

  mock_checkout_completed_at timestamptz,

  current_period_start timestamptz
    not null default now(),

  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.usage_monthly (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  month date not null
    default date_trunc(
      'month',
      now()
    )::date,

  message_count integer not null default 0
    check (
      message_count >= 0
    ),

  playground_message_count integer not null default 0
    check (
      playground_message_count >= 0
    ),

  widget_message_count integer not null default 0
    check (
      widget_message_count >= 0
    ),

  primary key (
    user_id,
    month
  )
);


create index assistants_owner_id_idx
  on public.assistants(owner_id);

create index knowledge_sources_assistant_id_idx
  on public.knowledge_sources(assistant_id);

create index knowledge_sources_status_idx
  on public.knowledge_sources(status);

create index knowledge_chunks_assistant_id_idx
  on public.knowledge_chunks(assistant_id);

create index knowledge_chunks_source_id_idx
  on public.knowledge_chunks(source_id);

create index conversations_assistant_id_idx
  on public.conversations(assistant_id);

create index conversations_user_id_idx
  on public.conversations(user_id);

create index messages_conversation_id_created_at_idx
  on public.messages(
    conversation_id,
    created_at
  );


create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


create trigger assistants_set_updated_at
before update on public.assistants
for each row
execute function public.set_updated_at();


create trigger knowledge_sources_set_updated_at
before update on public.knowledge_sources
for each row
execute function public.set_updated_at();


create trigger conversations_set_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();


create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'display_name',
        ''
      ),
      split_part(
        coalesce(new.email, ''),
        '@',
        1
      )
    )
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (
    user_id,
    plan,
    status,
    billing_mode
  )
  values (
    new.id,
    'free',
    'active',
    'mock'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


alter table public.profiles
enable row level security;

alter table public.assistants
enable row level security;

alter table public.knowledge_sources
enable row level security;

alter table public.knowledge_chunks
enable row level security;

alter table public.conversations
enable row level security;

alter table public.messages
enable row level security;

alter table public.subscriptions
enable row level security;

alter table public.usage_monthly
enable row level security;


create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);


create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);


create policy assistants_owner_all
on public.assistants
for all
to authenticated
using (
  owner_id = (select auth.uid())
)
with check (
  owner_id = (select auth.uid())
);


create policy knowledge_sources_owner_all
on public.knowledge_sources
for all
to authenticated
using (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      knowledge_sources.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      knowledge_sources.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
);


create policy knowledge_chunks_owner_all
on public.knowledge_chunks
for all
to authenticated
using (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      knowledge_chunks.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      knowledge_chunks.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
);


create policy conversations_owner_all
on public.conversations
for all
to authenticated
using (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      conversations.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assistants
    where assistants.id =
      conversations.assistant_id
      and assistants.owner_id =
        (select auth.uid())
  )
);


create policy messages_owner_all
on public.messages
for all
to authenticated
using (
  exists (
    select 1
    from public.conversations
    join public.assistants
      on assistants.id =
        conversations.assistant_id
    where conversations.id =
      messages.conversation_id
      and assistants.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.conversations
    join public.assistants
      on assistants.id =
        conversations.assistant_id
    where conversations.id =
      messages.conversation_id
      and assistants.owner_id =
        (select auth.uid())
  )
);


create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (
  user_id = (select auth.uid())
);


create policy usage_monthly_select_own
on public.usage_monthly
for select
to authenticated
using (
  user_id = (select auth.uid())
);


grant select, update
on public.profiles
to authenticated;

grant select, insert, update, delete
on public.assistants
to authenticated;

grant select, insert, update, delete
on public.knowledge_sources
to authenticated;

grant select, insert, update, delete
on public.knowledge_chunks
to authenticated;

grant select, insert, update, delete
on public.conversations
to authenticated;

grant select, insert, update, delete
on public.messages
to authenticated;

grant select
on public.subscriptions
to authenticated;

grant select
on public.usage_monthly
to authenticated;
