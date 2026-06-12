-- Migration: audit_reports table + audit-screenshots storage bucket
-- Decision record: DR-0007 (Supabase persistence for crawl outputs)
-- Apply in the Supabase SQL editor (DDL is not available via the REST key).
--
-- Safe to re-run: guarded with IF NOT EXISTS / ON CONFLICT.

-- ---------------------------------------------------------------------------
-- 1. Reports table — one row per crawl. "Latest" = newest crawl_date per site.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_reports (
    id          uuid primary key default gen_random_uuid(),
    site_id     text        not null,
    crawl_date  date        not null,
    scores      jsonb       not null default '{}'::jsonb,
    report      jsonb       not null,          -- the full versioned audit-report
    created_at  timestamptz not null default now(),
    unique (site_id, crawl_date)
);

create index if not exists audit_reports_site_latest_idx
    on public.audit_reports (site_id, crawl_date desc);

-- ---------------------------------------------------------------------------
-- 2. RLS — dashboard reads with the anon key; the crawler writes with the
--    service-role key (which bypasses RLS). So we only need a public SELECT.
-- ---------------------------------------------------------------------------
alter table public.audit_reports enable row level security;

drop policy if exists "audit_reports public read" on public.audit_reports;
create policy "audit_reports public read"
    on public.audit_reports
    for select
    using (true);

-- No INSERT/UPDATE policy: writes go through the service-role key only.

-- ---------------------------------------------------------------------------
-- 3. Storage bucket for screenshots (public read; service-role writes).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('audit-screenshots', 'audit-screenshots', true)
on conflict (id) do update set public = true;

drop policy if exists "audit-screenshots public read" on storage.objects;
create policy "audit-screenshots public read"
    on storage.objects
    for select
    using (bucket_id = 'audit-screenshots');
