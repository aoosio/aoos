-- ===============================================================
-- AOOS — Supabase Phase 2
-- 06 — Functions (ingest, metrics, compute) & Triggers
-- ===============================================================

-- Upsert supplier by phone
create or replace function public.upsert_supplier(_org uuid, _phone text, _name text default null)
returns uuid language plpgsql as $$
declare sid uuid;
begin
  insert into public.suppliers (org_id, distributor_phone, name)
  values (_org, _phone, _name)
  on conflict (org_id, distributor_phone) do update
    set name = coalesce(excluded.name, suppliers.name)
  returning id into sid;
  return sid;
end$$;

-- Upsert product key by (org,item); update current supplier when provided
create or replace function public.upsert_product_key(_org uuid, _item text, _supplier_id uuid)
returns uuid language plpgsql as $$
declare puid uuid;
begin
  insert into public.product_keys (org_id, item_name, supplier_id)
  values (_org, _item, _supplier_id)
  on conflict (org_id, item_name) do update
    set supplier_id = coalesce(excluded.supplier_id, public.product_keys.supplier_id)
  returning product_uuid into puid;
  return puid;
end$$;

-- Ingest: STOCK upload -> stock_eod
create or replace function public.ingest_stock_upload(_upload uuid)
returns void language plpgsql as $$
declare r record; _org uuid; _date date; _sid uuid; _p uuid;
begin
  select org_id, for_date into _org, _date from public.uploads where id=_upload and kind='stock';
  if not found then raise exception 'upload not found or wrong kind'; end if;

  for r in select * from public.stg_stock_rows where upload_id=_upload and coalesce(error,'') = '' loop
    _sid := public.upsert_supplier(_org, r.distributor_phone, null);
    _p := public.upsert_product_key(_org, r.item_name, _sid);

    insert into public.stock_eod (org_id, product_uuid, snapshot_date, on_hand_qty, earliest_expiry)
    values (_org, _p, _date, r.on_hand_qty, r.earliest_expiry)
    on conflict (org_id, product_uuid, snapshot_date)
      do update set on_hand_qty = excluded.on_hand_qty,
                    earliest_expiry = excluded.earliest_expiry;
  end loop;
end$$;

-- Ingest: SALES upload -> sales_daily
create or replace function public.ingest_sales_upload(_upload uuid)
returns void language plpgsql as $$
declare r record; _org uuid; _p uuid;
begin
  select org_id into _org from public.uploads where id=_upload and kind='sales';
  if not found then raise exception 'upload not found or wrong kind'; end if;

  for r in select * from public.stg_sales_rows where upload_id=_upload and coalesce(error,'') = '' loop
    select product_uuid into _p from public.product_keys where org_id=_org and item_name=r.item_name limit 1;
    if _p is null then
      _p := public.upsert_product_key(_org, r.item_name, null);
    end if;

    insert into public.sales_daily (org_id, product_uuid, sale_date, units_sold)
    values (_org, _p, r.date, r.units_sold)
    on conflict (org_id, product_uuid, sale_date)
      do update set units_sold = excluded.units_sold;
  end loop;
end$$;

-- Metrics helpers
create or replace function public.avg_daily_sales(_org uuid, _product uuid, _ref date, _window int default 30)
returns numeric language sql stable as $$
  with s as (
    select coalesce(sum(units_sold),0) as units
    from public.sales_daily
    where org_id=_org and product_uuid=_product
      and sale_date > _ref - make_interval(days => _window)
      and sale_date <= _ref
  )
  select case when (select units from s) > 0
              then (select units from s) / _window::numeric
              else 0 end;
$$;

create or replace function public.latest_on_hand(_org uuid, _product uuid, _ref date)
returns numeric language sql stable as $$
  select on_hand_qty
  from public.stock_eod
  where org_id=_org and product_uuid=_product and snapshot_date <= _ref
  order by snapshot_date desc limit 1;
$$;

create or replace function public.days_of_cover(_org uuid, _product uuid, _ref date)
returns numeric language sql stable as $$
  select case
    when public.avg_daily_sales(_org, _product, _ref, 30) = 0 then 999
    else coalesce(public.latest_on_hand(_org, _product, _ref),0) / public.avg_daily_sales(_org, _product, _ref, 30)
  end;
$$;

create or replace function public.price_change_ratio(_org uuid, _product uuid)
returns numeric language sql stable as $$
  with last2 as (
    select price_iqd, effective_at,
           row_number() over (order by effective_at desc) rn
    from public.product_prices
    where org_id=_org and product_uuid=_product
    order by effective_at desc limit 2
  )
  select case when count(*) < 2 then 0
              else (select l1.price_iqd - l2.price_iqd from last2 l1 join last2 l2 on l1.rn=1 and l2.rn=2)
                   / nullif((select price_iqd from last2 where rn=2),0)
         end
  from last2;
$$;

-- Compute safe qty (expiry-aware; obey freeze)
create or replace function public.compute_safe_qty(_org uuid, _product uuid, _ref date)
returns numeric language plpgsql as $$
declare m public.reorder_mode; target int; minq int; maxq int;
        onhand numeric; avgd numeric; lead int; exp date; safe numeric;
begin
  select coalesce(pr.reorder_mode, os.reorder_mode),
         coalesce(pr.target_doc, os.target_doc),
         coalesce(pr.min_qty, os.min_qty),
         coalesce(pr.max_qty, os.max_qty)
    into m, target, minq, maxq
  from public.org_settings os
  left join public.product_rules pr on pr.org_id=os.org_id and pr.product_uuid=_product
  where os.org_id=_org;

  onhand := coalesce(public.latest_on_hand(_org, _product, _ref),0);
  avgd := public.avg_daily_sales(_org, _product, _ref, 30);
  select days into lead from public.lead_times where org_id=_org and product_uuid=_product;
  lead := coalesce(lead, 5);
  select earliest_expiry into exp
  from public.stock_eod
  where org_id=_org and product_uuid=_product and snapshot_date = _ref
  limit 1;

  if m = 'min_max' then
    safe := greatest(0, (case when onhand < minq then (minq - onhand)
                              when onhand > maxq then 0
                              else (maxq - onhand) end));
  else
    if avgd = 0 then
      safe := 0;
    else
      if exp is not null then
        safe := greatest(0, avgd * (greatest((exp - _ref), 0) - lead) * 0.8);
      else
        safe := greatest(0, (target - (onhand/avgd)) * avgd);
      end if;
    end if;
  end if;

  if exists (select 1 from public.product_rules where org_id=_org and product_uuid=_product
             and freeze_until is not null and freeze_until > _ref) then
    return 0;
  end if;

  return round(safe);
end$$;

-- Audit trigger
create or replace function public.tr_audit()
returns trigger language plpgsql as $$
begin
  insert into public.audit_log(actor, org_id, action, table_name, row_pk, diff)
  values (auth.uid(), coalesce((new).org_id,(old).org_id), TG_OP, TG_TABLE_NAME,
          coalesce((new).id::text,(old).id::text),
          to_jsonb(coalesce(new, old)) );
  return coalesce(new, old);
end$$;

drop trigger if exists tr_audit_po_headers on public.po_headers;
create trigger tr_audit_po_headers after insert or update or delete on public.po_headers
for each row execute function public.tr_audit();

drop trigger if exists tr_audit_suggestions on public.suggestions;
create trigger tr_audit_suggestions after insert or update or delete on public.suggestions
for each row execute function public.tr_audit();
