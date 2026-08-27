create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  display_name text,
  role text not null default 'creator',
  created_at timestamptz not null default now()
);

create table if not exists public.riddims (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  producer_wallet text not null,
  status text not null default 'registered',
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  producer text not null,
  similarity numeric not null default 0,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  track_title text not null,
  amount numeric not null default 0,
  split jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_integrations (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  platform_type text not null,
  status text not null default 'demo',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_riddims_producer_wallet on public.riddims (producer_wallet);
create index if not exists idx_licenses_status on public.licenses (status);
create index if not exists idx_platform_integrations_platform on public.platform_integrations (platform);
