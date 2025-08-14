-- ===============================================================
-- AOOS — Supabase Phase 2
-- 07 — Suggestions Engine
-- ===============================================================
-- Implements the badges in the One-Pager v1.6:
-- RFQ, Return, Exchange, Promoter, Markdown, PriceUp, PriceDown,
-- LeadTime, Consolidation, Freeze, DataGap, Outflow, (Split stub), Escalation.
-- ===============================================================

create or replace function public.generate_suggestions_for_date(_org uuid, _ref date)
returns void language plpgsql as $$
declare r record;
        os record;
        doc numeric; avgd numeric; onhand numeric;
        rise numeric; dropv numeric;
        expsoon bool; slow bool;
        lead int;
begin
  -- Ensure settings row exists
  if not exists (select 1 from public.org_settings where org_id=_org) then
    insert into public.org_settings(org_id) values (_org) on conflict do nothing;
  end if;

  select * into os from public.org_settings where org_id=_org;

  for r in
    select pk.product_uuid, pk.supplier_id,
           public.latest_on_hand(_org, pk.product_uuid, _ref) as onhand_now,
           public.days_of_cover(_org, pk.product_uuid, _ref) as doc_now,
           (select earliest_expiry
              from public.stock_eod s
             where s.org_id=_org and s.product_uuid=pk.product_uuid and s.snapshot_date=_ref
             limit 1) as exp
    from public.product_keys pk
    where pk.org_id=_org
  loop
    doc := coalesce(r.doc_now, 999);
    onhand := coalesce(r.onhand_now, 0);
    avgd := public.avg_daily_sales(_org, r.product_uuid, _ref, 30);
    lead := coalesce((select days from public.lead_times where org_id=_org and product_uuid=r.product_uuid), 5);

    expsoon := r.exp is not null and r.exp <= (_ref + (os.expiry_soon_months || ' months')::interval);
    slow := (avgd = 0 and (select coalesce(sum(units_sold),0) from public.sales_daily
                            where org_id=_org and product_uuid=r.product_uuid and sale_date > _ref - interval '14 days') = 0)
            or doc > os.slow_mover_doc_gt;

    -- DataGap: missing supplier link or supplier has no name
    if r.supplier_id is null then
      insert into public.suggestions(org_id, product_uuid, s_type, reason, trigger_date)
      values (_org, r.product_uuid, 'DataGap', jsonb_build_object('missing','supplier'), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    elsif (select name is null from public.suppliers where id=r.supplier_id) then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'DataGap', jsonb_build_object('missing','supplier_name'), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- RFQ: price unknown or stale (>60 days)
    if not exists (
      select 1 from public.product_prices p
      where p.org_id=_org and p.product_uuid=r.product_uuid
        and p.effective_at > now() - interval '60 days'
    ) then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, status, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'RFQ', 'New', jsonb_build_object('why','price unknown or stale'), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- Return: 0 sales 14d or DoC > 60 or expiry soon
    if (avgd = 0 and (select coalesce(sum(units_sold),0) from public.sales_daily
                      where org_id=_org and product_uuid=r.product_uuid and sale_date > _ref - interval '14 days') = 0)
       or doc > os.slow_mover_doc_gt
       or expsoon then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, proposed_qty, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'Return',
              jsonb_build_object('doc',doc,'expiry',r.exp), onhand, _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- Promoter: slow + near-expiry
    if slow and expsoon then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'Promoter',
              jsonb_build_object('doc',doc,'expiry',r.exp), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- Markdown: near-expiry but sellable
    if expsoon and avgd > 0 then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'Markdown',
              jsonb_build_object('expiry',r.exp,'avg_daily',avgd), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- LeadTime: if DoC <= lead+1 and > 0 -> suggest early order
    if avgd > 0 and doc <= (lead + 1) and doc > 0 then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, proposed_qty, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'LeadTime',
              jsonb_build_object('doc',doc,'lead',lead),
              public.compute_safe_qty(_org, r.product_uuid, _ref), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- Freeze: active freeze_until
    if exists (select 1 from public.product_rules pr where pr.org_id=_org and pr.product_uuid=r.product_uuid and pr.freeze_until > _ref) then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'Freeze',
              jsonb_build_object('until',(select freeze_until from public.product_rules pr where pr.org_id=_org and pr.product_uuid=r.product_uuid)), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;

    -- Price flags
    rise := public.price_change_ratio(_org, r.product_uuid);
    if rise >= os.price_rise_pct then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'PriceUp', jsonb_build_object('ratio',rise), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;
    dropv := public.price_change_ratio(_org, r.product_uuid);
    if dropv <= -os.price_drop_pct then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'PriceDown', jsonb_build_object('ratio',dropv), _ref);
    end if;

    -- Outflow: stock[t-1] − stock[t] > sales[t] + threshold
    if exists (
      with a as (
        select on_hand_qty qty_t
        from public.stock_eod where org_id=_org and product_uuid=r.product_uuid and snapshot_date=_ref
      ), b as (
        select on_hand_qty qty_t1
        from public.stock_eod where org_id=_org and product_uuid=r.product_uuid and snapshot_date = _ref - interval '1 day'
      ), s as (
        select coalesce(sum(units_sold),0) as sold_t
        from public.sales_daily where org_id=_org and product_uuid=r.product_uuid and sale_date=_ref
      )
      select (b.qty_t1 - a.qty_t) > (s.sold_t + (select outflow_threshold from public.org_settings where org_id=_org))
      from a, b, s
    ) then
      insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
      values (_org, r.product_uuid, r.supplier_id, 'Outflow',
              jsonb_build_object('note','confirm return or adjust'), _ref)
      on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;
    end if;
  end loop;

  -- Exchange: value-balanced A→B across same supplier (simple heuristic)
  insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
  select _org, a.product_uuid, a.supplier_id, 'Exchange',
         jsonb_build_object('from',a.product_uuid,'to',b.product_uuid), _ref
  from (
    select pk.product_uuid, pk.supplier_id, public.days_of_cover(_org, pk.product_uuid, _ref) doc
    from public.product_keys pk where pk.org_id=_org
  ) a
  join (
    select pk.product_uuid, pk.supplier_id, public.days_of_cover(_org, pk.product_uuid, _ref) doc
    from public.product_keys pk where pk.org_id=_org
  ) b on a.supplier_id=b.supplier_id and a.product_uuid<>b.product_uuid
  where a.doc > (select slow_mover_doc_gt from public.org_settings where org_id=_org)
    and b.doc <= (select target_doc from public.org_settings where org_id=_org)
  on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;

  -- Consolidation: >= N micro-POs in last 7d → suggest consolidate
  insert into public.suggestions(org_id, supplier_id, s_type, reason, trigger_date)
  select _org, supplier_id, 'Consolidation',
         jsonb_build_object('pos_last_7d', cnt), _ref
  from (
    select supplier_id, count(*) cnt
    from public.po_headers
    where org_id=_org and created_at > now() - interval '7 days'
    group by supplier_id
  ) t
  where cnt >= (select weekly_consolidation_micro_pos from public.org_settings where org_id=_org)
  on conflict (org_id, supplier_id, s_type, trigger_date) do nothing;

  -- Escalation: RFQ waiting beyond 24h (second timeout in rfq_timeout_hrs array)
  insert into public.suggestions(org_id, product_uuid, supplier_id, s_type, reason, trigger_date)
  select s.org_id, s.product_uuid, s.supplier_id, 'Escalation',
         jsonb_build_object('rfq_id', s.id, 'age_hours', extract(epoch from (now() - (s.created_at))) / 3600.0),
         _ref
  from public.suggestions s
  join public.org_settings os on os.org_id = s.org_id
  where s.org_id = _org
    and s.s_type = 'RFQ' and s.status = 'WaitingRFQ'
    and s.created_at < now() - make_interval(hours => os.rfq_timeout_hrs[2])
  on conflict (org_id, product_uuid, s_type, trigger_date) do nothing;

  -- Split: (stub) to be triggered by supplier replies with limited qty in Phase 4.
  -- You may implement once WhatsApp replies are stored.
end$$;
