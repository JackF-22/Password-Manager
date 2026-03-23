-- Starred favorites + soft-delete trash. Run in Supabase SQL Editor if you already have passwords table.

alter table public.passwords
  add column if not exists is_favorite boolean not null default false,
  add column if not exists deleted_at timestamptz null;

create index if not exists passwords_user_deleted_idx
  on public.passwords (user_id, deleted_at);
