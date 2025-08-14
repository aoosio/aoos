-- ===============================================================
-- AOOS — Supabase Phase 2
-- 05 — Row-Level Security (RLS) & Policies
-- ===============================================================

-- Enable RLS on all tenant tables
alter table public.organizations  enable row level security;
alter table public.memberships    enable row level security;
alter table public.aoos_admins    enable row level security;
alter table public.suppliers      enable row level security;
alter table public.product_keys   enable row level security;
alter table public.uploads        enable row level security;
alter table public.stg_stock_rows enable row level security;
alter table public.stg_sales_rows enable row level security;
alter table public.stock_eod      enable row level security;
alter table public.sales_daily    enable row level security;
alter table public.product_prices enable row level security;
alter table public.lead_times     enable row level security;
alter table public.org_settings   enable row level security;
alter table public.product_rules  enable row level security;
alter table public.suggestions    enable row level security;
alter table public.po_headers     enable row level security;
alter table public.po_lines       enable row level security;
alter table public.audit_log      enable row level security;

-- Utility: AOOS admin check
create or replace function public.is_aoos_admin(uid uuid)
returns boolean language sql stable as
$$ select exists (select 1 from public.aoos_admins where user_id = uid); $$;

-- Organizations: members can read their org; owners/admins can update
drop policy if exists org_read on public.organizations;
create policy org_read on public.organizations
for select using (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = organizations.id and mm.user_id = auth.uid())
);

drop policy if exists org_write on public.organizations;
create policy org_write on public.organizations
for all using (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = organizations.id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
) with check (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = organizations.id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
);

-- Memberships: read if member; manage by owner/admin
drop policy if exists mem_read on public.memberships;
create policy mem_read on public.memberships
for select using (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = memberships.org_id and mm.user_id = auth.uid())
);

drop policy if exists mem_write on public.memberships;
create policy mem_write on public.memberships
for all using (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = memberships.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
) with check (
  public.is_aoos_admin(auth.uid()) or
  exists (select 1 from public.memberships mm where mm.org_id = memberships.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
);

-- AOOS Admins table: only AOOS admins can read/write
drop policy if exists aa_read on public.aoos_admins;
create policy aa_read on public.aoos_admins
for select using (public.is_aoos_admin(auth.uid()));
drop policy if exists aa_write on public.aoos_admins;
create policy aa_write on public.aoos_admins
for all using (public.is_aoos_admin(auth.uid())) with check (public.is_aoos_admin(auth.uid()));

-- Helper procedure to attach common read/write policies to org-bound tables
do $$
declare t text;
begin
  -- Tables where PO MANAGER can write
  for t in
    select unnest(array[
      'suppliers','product_keys','uploads','stg_stock_rows','stg_sales_rows',
      'stock_eod','sales_daily','product_prices','lead_times',
      'suggestions','po_headers','po_lines'
    ])
  loop
    execute format('drop policy if exists %I on public.%I;', t||'_read', t);
    execute format('create policy %I on public.%I for select using (public.is_aoos_admin(auth.uid()) or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid()));', t||'_read', t, t);

    execute format('drop policy if exists %I on public.%I;', t||'_write', t);
    execute format($f$
      create policy %I on public.%I for all using (
        public.is_aoos_admin(auth.uid())
        or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin','po_manager'))
      ) with check (
        public.is_aoos_admin(auth.uid())
        or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin','po_manager'))
      );
    $f$, t||'_write', t, t, t);
  end loop;

  -- Tables where ONLY OWNER/ADMIN can write
  for t in
    select unnest(array['org_settings','product_rules'])
  loop
    execute format('drop policy if exists %I on public.%I;', t||'_read', t);
    execute format('create policy %I on public.%I for select using (public.is_aoos_admin(auth.uid()) or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid()));', t||'_read', t, t);

    execute format('drop policy if exists %I on public.%I;', t||'_write', t);
    execute format($f$
      create policy %I on public.%I for all using (
        public.is_aoos_admin(auth.uid())
        or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
      ) with check (
        public.is_aoos_admin(auth.uid())
        or exists (select 1 from public.memberships mm where mm.org_id = %I.org_id and mm.user_id = auth.uid() and mm.role in ('owner','admin'))
      );
    $f$, t||'_write', t, t, t);
  end loop;
end$$;

-- Audit log: allow INSERT (for triggers) and read by org members; no direct updates/deletes
drop policy if exists audit_insert on public.audit_log;
create policy audit_insert on public.audit_log
for insert with check (true);

drop policy if exists audit_read on public.audit_log;
create policy audit_read on public.audit_log
for select using (
  public.is_aoos_admin(auth.uid()) or
  audit_log.org_id is null or
  exists (select 1 from public.memberships mm where mm.org_id = audit_log.org_id and mm.user_id = auth.uid())
);
