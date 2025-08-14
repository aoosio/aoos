-- ===============================================================
-- AOOS — Supabase Phase 2
-- 00 — Extensions & Setup
-- ===============================================================
-- Purpose: enable required extensions and set safe defaults.
-- Notes: run this first.
-- ===============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Optional: ensure timezone used in date maths is Baghdad (we still store timestamptz UTC)
-- This does not change storage, only session calculations when using now()::date in SQL editor.
-- set timezone to 'Asia/Baghdad';

-- ---------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('owner','admin','po_manager','viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.upload_kind as enum ('stock','sales');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reorder_mode as enum ('min_max','doc');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.suggestion_type as enum (
    'RFQ','Return','Exchange','Promoter','Markdown',
    'PriceUp','PriceDown','LeadTime','Consolidation',
    'Freeze','DataGap','Outflow','Split','Escalation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.suggestion_status as enum (
    'New','WaitingRFQ','Accepted','Declined','Snoozed','Muted','Resolved'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.po_status as enum ('Draft','Dispatched','Failed','Delivered','Cancelled');
exception when duplicate_object then null; end $$;
