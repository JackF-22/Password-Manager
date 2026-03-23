-- Run this in Supabase: Dashboard → SQL Editor → New query → Paste → Run
-- Safe to run more than once.
-- Already have passwords without is_favorite / deleted_at? Also run:
-- supabase/migrations/20250323140000_passwords_favorite_trash.sql

create extension if not exists "pgcrypto";

create table if not exists public.passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  site_name text not null,
  username text not null,
  encrypted_value text not null,
  iv text not null,
  salt text not null,
  is_favorite boolean not null default false,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists passwords_user_id_idx on public.passwords (user_id);
create index if not exists passwords_user_deleted_idx on public.passwords (user_id, deleted_at);

alter table public.passwords enable row level security;

drop policy if exists "passwords_select_own" on public.passwords;
drop policy if exists "passwords_insert_own" on public.passwords;
drop policy if exists "passwords_update_own" on public.passwords;
drop policy if exists "passwords_delete_own" on public.passwords;

create policy "passwords_select_own"
  on public.passwords for select
  using (auth.uid() = user_id);

create policy "passwords_insert_own"
  on public.passwords for insert
  with check (auth.uid() = user_id);

create policy "passwords_update_own"
  on public.passwords for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "passwords_delete_own"
  on public.passwords for delete
  using (auth.uid() = user_id);
