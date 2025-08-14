-- TABLES + INDEXES + RLS (no enum alterations here)

-- Core org & access
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  timezone text default 'Asia/Baghdad',
  working_days int[] default '{1,2,3,4,5,6}',
  default_cadence text default 'WEEKLY',
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'PO_MANAGER',
  created_at timestamptz default now(),
  unique (org_id, user_id)
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  city text,
  created_at timestamptz default now()
);

-- Suppliers & channel
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  phone_e164 text not null,
  is_whatsapp boolean default true,
  opted_in boolean default true,
  created_at timestamptz default now(),
  unique (org_id, phone_e164)
);

create table if not exists channel_whatsapp (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  phone_number_id text not null,
  waba_id text not null,
  token_masked text,
  is_connected boolean default false,
  last_test_at timestamptz,
  created_at timestamptz default now(),
  unique (org_id)
);

-- Catalog & preferences
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  barcode text not null,
  name text,
  pack_size int default 1,
  moq int default 0,
  lead_time_days int default 3,
  created_at timestamptz default now(),
  unique (org_id, barcode)
);

create table if not exists reorder_prefs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  cadence text not null,
  day_of_week int[],
  source text not null default 'USER',
  notes text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);

-- Data in (uploads)
create table if not exists report_uploads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  kind report_kind not null,
  uploaded_by uuid not null references auth.users(id),
  uploaded_at timestamptz not null default now(),
  filename text
);

create table if not exists sales_rows (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references report_uploads(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  sold_qty numeric not null,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_sales_rows_product on sales_rows(product_id);
create index if not exists idx_sales_rows_recorded_at on sales_rows(recorded_at);

create table if not exists inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references report_uploads(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_phone text,
  qty numeric not null,
  expiry_date date,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_inventory_snapshots_product on inventory_snapshots(product_id);
create index if not exists idx_inventory_snapshots_recorded_at on inventory_snapshots(recorded_at);

-- Suggestions & inquiries
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  kind suggestion_kind not null,
  subtype suggestion_subtype not null,
  reason text,
  recommended_qty int,
  payload jsonb default '{}'::jsonb,
  status suggestion_status not null default 'PENDING',
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists idx_suggestions_scope on suggestions(org_id, store_id, supplier_id, product_id);
create index if not exists idx_suggestions_status on suggestions(status);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  suggestion_id uuid references suggestions(id) on delete set null,
  type suggestion_subtype not null,
  to_phone text not null,
  template_name text not null,
  variables jsonb not null,
  status inquiry_status default 'DRAFT',
  -- Manual answer fields:
  answer_bool boolean,
  answer_discount boolean,
  answer_price_direction price_direction,
  answer_date_relation rel_binary,
  answer_date date,
  answer_qty_relation qty_relation,
  answer_qty_threshold numeric,
  answered_by uuid references auth.users(id),
  answered_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists idx_inquiries_supplier on inquiries(org_id, supplier_id, status);

-- Purchase orders
create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  po_number text not null,
  status po_status not null default 'DRAFT',
  to_phone text,
  totals numeric default 0,
  promised_date date,
  acknowledged_at timestamptz,
  delivered_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  unique (org_id, po_number)
);
create index if not exists idx_purchase_orders_status on purchase_orders(org_id, status);

create table if not exists purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty int not null,
  unit_price numeric,
  status po_item_status default 'OPEN'
);
create index if not exists idx_poi_po on purchase_order_items(po_id);

-- WhatsApp outbox & audit
create table if not exists whatsapp_outbox (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  to_phone text not null,
  template_name text not null,
  payload jsonb not null,
  api_response jsonb,
  status outbox_status default 'QUEUED',
  created_at timestamptz default now()
);
create index if not exists idx_outbox_org_time on whatsapp_outbox(org_id, created_at desc);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  actor uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_org_time on audit_log(org_id, created_at desc);

-- Materialized view (create if absent)
do $$ begin
  if not exists (select 1 from pg_matviews where schemaname='public' and matviewname='mv_weekly_sales') then
    create materialized view public.mv_weekly_sales as
    select org_id, store_id, product_id,
           greatest(0.01, sum(sold_qty)::numeric) as weekly_sales_equiv
    from sales_rows
    where recorded_at >= now() - interval '28 days'
    group by 1,2,3
    with no data;
    refresh materialized view public.mv_weekly_sales;
  end if;
end $$;

-- RLS helper functions
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable as $$
  select exists (select 1 from public.members m where m.org_id=p_org and m.user_id=auth.uid());
$$;

create or replace function public.has_role(p_org uuid, p_role member_role)
returns boolean language sql stable as $$
  select exists (select 1 from public.members m where m.org_id=p_org and m.user_id=auth.uid() and m.role=p_role);
$$;

-- Enable RLS
alter table organizations enable row level security;
alter table members enable row level security;
alter table stores enable row level security;
alter table suppliers enable row level security;
alter table supplier_contacts enable row level security;
alter table channel_whatsapp enable row level security;
alter table products enable row level security;
alter table reorder_prefs enable row level security;
alter table report_uploads enable row level security;
alter table sales_rows enable row level security;
alter table inventory_snapshots enable row level security;
alter table suggestions enable row level security;
alter table inquiries enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table whatsapp_outbox enable row level security;
alter table audit_log enable row level security;

-- Policies (drop if exists, then recreate)
drop policy if exists org_select on organizations;
drop policy if exists org_insert on organizations;
drop policy if exists org_update on organizations;
create policy org_select on organizations for select to authenticated using (is_org_member(id));
create policy org_insert on organizations for insert to authenticated with check (true);
create policy org_update on organizations for update to authenticated using (is_org_member(id) and has_role(id,'OWNER')) with check (is_org_member(id) and has_role(id,'OWNER'));

drop policy if exists members_select on members;
drop policy if exists members_insert_owner on members;
drop policy if exists members_update_owner on members;
drop policy if exists members_delete_owner on members;
create policy members_select on members for select to authenticated using (is_org_member(org_id));
create policy members_insert_owner on members for insert to authenticated with check (has_role(org_id,'OWNER'));
create policy members_update_owner on members for update to authenticated using (has_role(org_id,'OWNER')) with check (has_role(org_id,'OWNER'));
create policy members_delete_owner on members for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_stores on stores;
drop policy if exists org_table_insert_stores on stores;
drop policy if exists org_table_update_stores on stores;
drop policy if exists org_table_delete_stores on stores;
create policy org_table_select_stores on stores for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_stores on stores for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_stores on stores for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_stores on stores for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_suppliers on suppliers;
drop policy if exists org_table_insert_suppliers on suppliers;
drop policy if exists org_table_update_suppliers on suppliers;
drop policy if exists org_table_delete_suppliers on suppliers;
create policy org_table_select_suppliers on suppliers for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_suppliers on suppliers for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_suppliers on suppliers for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_suppliers on suppliers for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_supplier_contacts on supplier_contacts;
drop policy if exists org_table_insert_supplier_contacts on supplier_contacts;
drop policy if exists org_table_update_supplier_contacts on supplier_contacts;
drop policy if exists org_table_delete_supplier_contacts on supplier_contacts;
create policy org_table_select_supplier_contacts on supplier_contacts for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_supplier_contacts on supplier_contacts for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_supplier_contacts on supplier_contacts for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_supplier_contacts on supplier_contacts for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_channel_whatsapp on channel_whatsapp;
drop policy if exists org_table_insert_channel_whatsapp on channel_whatsapp;
drop policy if exists org_table_update_channel_whatsapp on channel_whatsapp;
drop policy if exists org_table_delete_channel_whatsapp on channel_whatsapp;
create policy org_table_select_channel_whatsapp on channel_whatsapp for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_channel_whatsapp on channel_whatsapp for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_channel_whatsapp on channel_whatsapp for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_channel_whatsapp on channel_whatsapp for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_products on products;
drop policy if exists org_table_insert_products on products;
drop policy if exists org_table_update_products on products;
drop policy if exists org_table_delete_products on products;
create policy org_table_select_products on products for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_products on products for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_products on products for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_products on products for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_reorder_prefs on reorder_prefs;
drop policy if exists org_table_insert_reorder_prefs on reorder_prefs;
drop policy if exists org_table_update_reorder_prefs on reorder_prefs;
drop policy if exists org_table_delete_reorder_prefs on reorder_prefs;
create policy org_table_select_reorder_prefs on reorder_prefs for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_reorder_prefs on reorder_prefs for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_reorder_prefs on reorder_prefs for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_reorder_prefs on reorder_prefs for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_report_uploads on report_uploads;
drop policy if exists org_table_insert_report_uploads on report_uploads;
drop policy if exists org_table_update_report_uploads on report_uploads;
drop policy if exists org_table_delete_report_uploads on report_uploads;
create policy org_table_select_report_uploads on report_uploads for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_report_uploads on report_uploads for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_report_uploads on report_uploads for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_report_uploads on report_uploads for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_sales_rows on sales_rows;
drop policy if exists org_table_insert_sales_rows on sales_rows;
drop policy if exists org_table_update_sales_rows on sales_rows;
drop policy if exists org_table_delete_sales_rows on sales_rows;
create policy org_table_select_sales_rows on sales_rows for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_sales_rows on sales_rows for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_sales_rows on sales_rows for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_sales_rows on sales_rows for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_inventory_snapshots on inventory_snapshots;
drop policy if exists org_table_insert_inventory_snapshots on inventory_snapshots;
drop policy if exists org_table_update_inventory_snapshots on inventory_snapshots;
drop policy if exists org_table_delete_inventory_snapshots on inventory_snapshots;
create policy org_table_select_inventory_snapshots on inventory_snapshots for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_inventory_snapshots on inventory_snapshots for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_inventory_snapshots on inventory_snapshots for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_inventory_snapshots on inventory_snapshots for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_suggestions on suggestions;
drop policy if exists org_table_insert_suggestions on suggestions;
drop policy if exists org_table_update_suggestions on suggestions;
drop policy if exists org_table_delete_suggestions on suggestions;
create policy org_table_select_suggestions on suggestions for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_suggestions on suggestions for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_suggestions on suggestions for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_suggestions on suggestions for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_inquiries on inquiries;
drop policy if exists org_table_insert_inquiries on inquiries;
drop policy if exists org_table_update_inquiries on inquiries;
drop policy if exists org_table_delete_inquiries on inquiries;
create policy org_table_select_inquiries on inquiries for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_inquiries on inquiries for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_inquiries on inquiries for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_inquiries on inquiries for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_purchase_orders on purchase_orders;
drop policy if exists org_table_insert_purchase_orders on purchase_orders;
drop policy if exists org_table_update_purchase_orders on purchase_orders;
drop policy if exists org_table_delete_purchase_orders on purchase_orders;
create policy org_table_select_purchase_orders on purchase_orders for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_purchase_orders on purchase_orders for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_purchase_orders on purchase_orders for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_purchase_orders on purchase_orders for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_purchase_order_items on purchase_order_items;
drop policy if exists org_table_insert_purchase_order_items on purchase_order_items;
drop policy if exists org_table_update_purchase_order_items on purchase_order_items;
drop policy if exists org_table_delete_purchase_order_items on purchase_order_items;
create policy org_table_select_purchase_order_items on purchase_order_items
  for select to authenticated using (
    exists (select 1 from purchase_orders po where po.id = purchase_order_items.po_id and is_org_member(po.org_id))
  );
create policy org_table_insert_purchase_order_items on purchase_order_items
  for insert to authenticated with check (
    exists (select 1 from purchase_orders po where po.id = purchase_order_items.po_id and is_org_member(po.org_id))
  );
create policy org_table_update_purchase_order_items on purchase_order_items
  for update to authenticated using (
    exists (select 1 from purchase_orders po where po.id = purchase_order_items.po_id and is_org_member(po.org_id))
  ) with check (
    exists (select 1 from purchase_orders po where po.id = purchase_order_items.po_id and is_org_member(po.org_id))
  );
create policy org_table_delete_purchase_order_items on purchase_order_items
  for delete to authenticated using (
    exists (select 1 from purchase_orders po where po.id = purchase_order_items.po_id and has_role(po.org_id,'OWNER'))
  );

drop policy if exists org_table_select_whatsapp_outbox on whatsapp_outbox;
drop policy if exists org_table_insert_whatsapp_outbox on whatsapp_outbox;
drop policy if exists org_table_update_whatsapp_outbox on whatsapp_outbox;
drop policy if exists org_table_delete_whatsapp_outbox on whatsapp_outbox;
create policy org_table_select_whatsapp_outbox on whatsapp_outbox for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_whatsapp_outbox on whatsapp_outbox for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_whatsapp_outbox on whatsapp_outbox for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_whatsapp_outbox on whatsapp_outbox for delete to authenticated using (has_role(org_id,'OWNER'));

drop policy if exists org_table_select_audit_log on audit_log;
drop policy if exists org_table_insert_audit_log on audit_log;
drop policy if exists org_table_update_audit_log on audit_log;
drop policy if exists org_table_delete_audit_log on audit_log;
create policy org_table_select_audit_log on audit_log for select to authenticated using (is_org_member(org_id));
create policy org_table_insert_audit_log on audit_log for insert to authenticated with check (is_org_member(org_id));
create policy org_table_update_audit_log on audit_log for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy org_table_delete_audit_log on audit_log for delete to authenticated using (has_role(org_id,'OWNER'));
