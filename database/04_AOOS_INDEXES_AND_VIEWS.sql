-- ===============================================================
-- AOOS — Supabase Phase 2
-- 04 — Indexes & Views
-- ===============================================================

-- Helpful indexes
create index if not exists idx_suppliers_org_phone on public.suppliers(org_id, distributor_phone);
create index if not exists idx_product_keys_org_item on public.product_keys(org_id, item_name);
create index if not exists idx_uploads_org_kind_created on public.uploads(org_id, kind, created_at);
create index if not exists idx_stg_stock_upload on public.stg_stock_rows(upload_id);
create index if not exists idx_stg_sales_upload on public.stg_sales_rows(upload_id);
create index if not exists idx_stock_by_org_date on public.stock_eod(org_id, product_uuid, snapshot_date);
create index if not exists idx_sales_by_org_date on public.sales_daily(org_id, product_uuid, sale_date);
create index if not exists idx_prices_by_product_time on public.product_prices(org_id, product_uuid, effective_at desc);
create index if not exists idx_lead_times_key on public.lead_times(org_id, product_uuid);
create index if not exists idx_suggestions_status on public.suggestions(org_id, status, s_type, trigger_date);
create index if not exists idx_po_headers_org_time on public.po_headers(org_id, created_at);
create index if not exists idx_po_lines_po on public.po_lines(po_id);

-- Convenience view: memberships for quick policy checks
create or replace view public.v_user_orgs as
select m.user_id, m.org_id, m.role
from public.memberships m;

-- Weekly & Monthly aggregates (RLS applies through base tables)
create or replace view public.v_sales_weekly as
select sd.org_id,
       sd.product_uuid,
       date_trunc('week', sd.sale_date)::date as week_start,
       sum(sd.units_sold) as units_sold
from public.sales_daily sd
group by sd.org_id, sd.product_uuid, week_start;

create or replace view public.v_sales_monthly as
select sd.org_id,
       sd.product_uuid,
       date_trunc('month', sd.sale_date)::date as month_start,
       sum(sd.units_sold) as units_sold
from public.sales_daily sd
group by sd.org_id, sd.product_uuid, month_start;
