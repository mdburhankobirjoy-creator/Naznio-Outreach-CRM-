-- Naznio Outreach CRM — shared database schema
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

-- ── Users (simple username/password table, matches the app's existing login) ──
create table if not exists public.users (
  id text primary key,
  username text unique not null,
  password text not null,       -- NOTE: plain text to match current app logic; upgrade to Supabase Auth later for real security
  role text not null check (role in ('Admin', 'Employee')),
  created_at date not null default current_date
);

-- ── Leads ──
create table if not exists public.leads (
  id text primary key,
  business_name text not null,
  owner_name text,
  email text,
  phone text,
  website text,
  niche text,
  city_state text,
  source text,
  status text not null default 'Not Sent',
  last_contacted text,
  next_follow_up text,
  notes text,
  created_by text,
  updated_at timestamptz not null default now()
);

-- ── Activity logs ──
create table if not exists public.activity_logs (
  id text primary key,
  username text not null,
  business_name text,
  lead_id text,
  type text not null,
  timestamp timestamptz not null default now()
);

-- Seed a default admin so the first login works out of the box
insert into public.users (id, username, password, role, created_at)
values ('u-1', 'admin', 'admin123', 'Admin', current_date)
on conflict (id) do nothing;

-- ── Row Level Security ──
-- This is an internal team tool, so we allow the "anon" key (used by the browser)
-- full read/write access. Anyone with the anon key + your Supabase URL can read/write,
-- so treat that key like a shared team password, not a public secret.
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "allow all users" on public.users;
create policy "allow all users" on public.users for all using (true) with check (true);

drop policy if exists "allow all leads" on public.leads;
create policy "allow all leads" on public.leads for all using (true) with check (true);

drop policy if exists "allow all activity_logs" on public.activity_logs;
create policy "allow all activity_logs" on public.activity_logs for all using (true) with check (true);

-- ── Realtime ──
-- Enables live sync: when one user adds/edits/deletes a lead, everyone else's
-- browser gets pushed the change instantly.
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.users;
