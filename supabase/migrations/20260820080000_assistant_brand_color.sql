-- Add per-assistant brand color used by customer-facing chat UI.
-- Existing assistants keep the current AQENA dark neutral as default.

alter table public.assistants
  add column brand_color text not null default '#1d1e1a'
  check (brand_color ~ '^#[0-9A-Fa-f]{6}$');

comment on column public.assistants.brand_color is
  'Six-digit hexadecimal brand color for customer-facing assistant UI';
