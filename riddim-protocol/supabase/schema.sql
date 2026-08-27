-- Riddim Protocol — offchain mirror/index schema (Supabase / Postgres).
--
-- The onchain RiddimRegistry contract is the SOURCE OF TRUTH for riddims,
-- tracks, voice clones, and tips. This database is a fast-read mirror that also
-- holds things the chain does not: media URLs, AI reuse proposals, and
-- normalized records synced from external platforms.
--
-- Every mirrored row carries optional onchain linkage (onchain_*_id, tx_hash,
-- chain_id). When the contract is not yet deployed the app runs in "offchain
-- mode" and these stay null. This file is idempotent — safe to re-run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  display_name text,
  role text not null default 'creator',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- riddims
-- ---------------------------------------------------------------------------
create table if not exists public.riddims (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  producer_wallet text not null,
  status text not null default 'registered',
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.riddims add column if not exists onchain_riddim_id bigint;
alter table public.riddims add column if not exists tx_hash text;
alter table public.riddims add column if not exists chain_id bigint;

-- ---------------------------------------------------------------------------
-- tracks (a track licenses one or more riddims; may attach voice clones)
-- ---------------------------------------------------------------------------
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_wallet text not null,
  riddim_ids jsonb not null default '[]'::jsonb,      -- onchain riddim ids
  voice_clone_ids jsonb not null default '[]'::jsonb, -- attached onchain voice ids
  onchain_track_id bigint,
  tx_hash text,
  chain_id bigint,
  total_tipped numeric not null default 0,
  media_url text,
  status text not null default 'licensed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- voice_clones (first-class licensed voice, royalty capped at 50% onchain)
-- ---------------------------------------------------------------------------
create table if not exists public.voice_clones (
  id uuid primary key default gen_random_uuid(),
  voice_name text not null,
  artist_wallet text not null,
  royalty_bps integer not null default 0,
  payout_wallet text not null,
  onchain_voice_id bigint,
  tx_hash text,
  chain_id bigint,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- licenses (a confirmed reuse: riddim -> track). Human-approved.
-- ---------------------------------------------------------------------------
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  producer text not null,
  similarity numeric not null default 0,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);

alter table public.licenses add column if not exists riddim_id bigint;
alter table public.licenses add column if not exists track_id bigint;
alter table public.licenses add column if not exists tx_hash text;
alter table public.licenses add column if not exists chain_id bigint;
alter table public.licenses add column if not exists proposed_by text default 'human';

-- ---------------------------------------------------------------------------
-- tips (mirror of an onchain tipTrack, with the computed split)
-- ---------------------------------------------------------------------------
create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  track_title text not null,
  amount numeric not null default 0,
  split jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tips add column if not exists track_id bigint;
alter table public.tips add column if not exists tipper_wallet text;
alter table public.tips add column if not exists tx_hash text;
alter table public.tips add column if not exists chain_id bigint;

-- ---------------------------------------------------------------------------
-- detections (AI reuse PROPOSALS — never auto-licensed; human confirms)
-- ---------------------------------------------------------------------------
create table if not exists public.detections (
  id uuid primary key default gen_random_uuid(),
  query_title text not null,
  matched_riddim_title text,
  matched_riddim_id bigint,
  similarity numeric not null default 0,
  confidence text not null default 'none',   -- high | medium | none
  recommendation text not null default 'no-match',
  status text not null default 'proposed',    -- proposed | confirmed | dismissed
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- platform_records (normalized rights rows synced from external platforms)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_records (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  external_track_id text not null,
  title text not null,
  artist text not null,
  rights_owner_wallet text,
  usage_type text not null default 'streaming',
  license_status text not null default 'registered',
  source_url text,
  payout_split jsonb not null default '[]'::jsonb,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (platform, external_track_id)
);

-- Legacy table kept for backwards compatibility with the first prototype.
create table if not exists public.platform_integrations (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  platform_type text not null,
  status text not null default 'demo',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_riddims_producer_wallet on public.riddims (producer_wallet);
create index if not exists idx_riddims_onchain on public.riddims (onchain_riddim_id);
create index if not exists idx_tracks_onchain on public.tracks (onchain_track_id);
create index if not exists idx_tracks_artist on public.tracks (artist_wallet);
create index if not exists idx_voice_clones_onchain on public.voice_clones (onchain_voice_id);
create index if not exists idx_licenses_status on public.licenses (status);
create index if not exists idx_tips_track on public.tips (track_id);
create index if not exists idx_detections_status on public.detections (status);
create index if not exists idx_platform_records_platform on public.platform_records (platform);
create index if not exists idx_platform_integrations_platform on public.platform_integrations (platform);
