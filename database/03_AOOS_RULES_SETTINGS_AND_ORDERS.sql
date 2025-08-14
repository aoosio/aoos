-- ===============================================================
-- AOOS — Supabase Phase 2
-- 03 — Rules, Thresholds, Suggestions, POs, Audit
-- ===============================================================

-- Prices & lead times
create table if not exists public.product_prices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid) on delete cascade,
  price_iqd numeric not null,
  source text not null default 'po',  -- 'rfq' | 'po' | 'manual'
  effective_at timestamptz not null default now()
);

create table if not exists public.lead_times (
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid) on delete cascade,
  days int not null default 5,
  primary key (org_id, product_uuid)
);

-- Org-wide settings & thresholds
create table if not exists public.org_settings (
  org_id uuid primary key references public.organizations(id) on delete cascade,
  reorder_mode public.reorder_mode not null default 'doc',
  target_doc int not null default 14,
  min_qty int not null default 0,
  max_qty int not null default 0,
  expiry_soon_months int not null default 6,
  slow_mover_no_sales_days int not null default 14,
  slow_mover_doc_gt int not null default 60,
  price_rise_pct numeric not null default 0.07,
  price_drop_pct numeric not null default 0.05,
  rfq_timeout_hrs int[] not null default '{6,24}',
  outflow_threshold int not null default 2,
  weekly_consolidation_micro_pos int not null default 3,
  updated_at timestamptz default now()
);

-- Optional per-product overrides
create table if not exists public.product_rules (
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid) on delete cascade,
  reorder_mode public.reorder_mode,
  target_doc int,
  min_qty int,
  max_qty int,
  freeze_until date,
  primary key (org_id, product_uuid)
);

-- Suggestions
create table if not exists public.suggestions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid references public.product_keys(product_uuid),
  supplier_id uuid references public.suppliers(id),
  s_type public.suggestion_type not null,
  status public.suggestion_status not null default 'New',
  trigger_date date not null default (now() at time zone 'Asia/Baghdad')::date,
  reason jsonb,
  impact jsonb,
  proposed_qty numeric,
  snooze_until date,
  muted boolean default false,
  last_outbound_at timestamptz,
  created_at timestamptz default now()
);

-- Enforce one suggestion per (org, product, type, day) or (org, supplier, type, day)
do $$ begin
  create unique index if not exists ux_suggestions_product_daily
    on public.suggestions(org_id, product_uuid, s_type, trigger_date)
    where product_uuid is not null;
exception when duplicate_table then null; end $$;

do $$ begin
  create unique index if not exists ux_suggestions_supplier_daily
    on public.suggestions(org_id, supplier_id, s_type, trigger_date)
    where product_uuid is null and supplier_id is not null;
exception when duplicate_table then null; end $$;

-- POs
create table if not exists public.po_headers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id),
  status public.po_status not null default 'Draft',
  total_iqd numeric default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  dispatched_at timestamptz
);

create table if not exists public.po_lines (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid not null references public.po_headers(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid),
  qty numeric not null,
  price_iqd numeric,
  line_total_iqd numeric generated always as (coalesce(qty,0)*coalesce(price_iqd,0)) stored
);

-- Audit log
create table if not exists public.audit_log (
  id bigserial primary key,
  occurred_at timestamptz default now(),
  actor uuid,         -- auth.users.id (nullable for system)
  org_id uuid,
  action text not null,
  table_name text,
  row_pk text,
  diff jsonb
);
