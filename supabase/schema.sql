create extension if not exists pgcrypto;

create table if not exists public.microbe_strains (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  sequencing_identified text,
  sequencing_type text,
  sequencing_company text,
  sequence_text text,
  phylum text,
  class_name text,
  order_name text,
  family text,
  genus text,
  crop text,
  source_part text,
  collection_location text,
  isolation_date text,
  medium text,
  temperature text,
  storage_condition text,
  freezer_number text,
  original_freezer_number text,
  storage_location text,
  owner text,
  has_patent text,
  patent_name text,
  has_paper text,
  paper_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists microbe_strains_code_idx
  on public.microbe_strains (code);

create index if not exists microbe_strains_genus_idx
  on public.microbe_strains (genus);

create index if not exists microbe_strains_crop_idx
  on public.microbe_strains (crop);

create index if not exists microbe_strains_freezer_number_idx
  on public.microbe_strains (freezer_number);

create index if not exists microbe_strains_storage_location_idx
  on public.microbe_strains (storage_location);

alter table public.microbe_strains enable row level security;

drop policy if exists "Allow public read access" on public.microbe_strains;

create policy "Allow public read access"
  on public.microbe_strains
  for select
  to anon, authenticated
  using (true);

