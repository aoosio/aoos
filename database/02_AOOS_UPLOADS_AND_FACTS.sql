-- ===============================================================
-- AOOS — Supabase Phase 2
-- 02 — Uploads, Staging, Facts (Stock EOD & Sales)
-- ===============================================================

-- Uploads
create table if not exists public.uploads (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind public.upload_kind not null,
  filename text not null,
  for_date date not null default (now() at time zone 'Asia/Baghdad')::date,
  row_count int default 0,
  error_count int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Staging: stock rows
create table if not exists public.stg_stock_rows (
  upload_id uuid not null references public.uploads(id) on delete cascade,
  row_num int not null,
  item_name text not null,
  on_hand_qty numeric not null,
  distributor_phone text not null,
  earliest_expiry date,
  error text,
  primary key (upload_id, row_num)
);

-- Staging: sales rows (Phase 1 spec: item_name,date,units_sold)
create table if not exists public.stg_sales_rows (
  upload_id uuid not null references public.uploads(id) on delete cascade,
  row_num int not null,
  item_name text not null,
  date date not null,
  units_sold numeric not null,
  error text,
  primary key (upload_id, row_num)
);

-- Facts: end-of-day stock
create table if not exists public.stock_eod (
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid) on delete cascade,
  snapshot_date date not null,
  on_hand_qty numeric not null,
  earliest_expiry date,
  created_at timestamptz default now(),
  primary key (org_id, product_uuid, snapshot_date)
);

-- Facts: daily sales
create table if not exists public.sales_daily (
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_uuid uuid not null references public.product_keys(product_uuid) on delete cascade,
  sale_date date not null,
  units_sold numeric not null,
  created_at timestamptz default now(),
  primary key (org_id, product_uuid, sale_date)
);
