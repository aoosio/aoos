-- ENUMS (create if missing; add any missing labels), no tables here
create extension if not exists "pgcrypto";

do $$ begin
  if not exists (select 1 from pg_type where typname='member_role') then
    create type member_role as enum ('OWNER','PO_MANAGER');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='report_kind') then
    create type report_kind as enum ('SALES','STOCK');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='suggestion_kind') then
    create type suggestion_kind as enum ('INQUIRY','STOCK_OP');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='suggestion_subtype') then
    create type suggestion_subtype as enum (
      'INQ_STOCK','INQ_EXPIRY_LATEST','INQ_BULK_PRICE','REQ_PROMOTER','REQ_EXCHANGE','INQ_SLA','REMINDER',
      'REFILL_WEEKS','FAST_TOPUP','OVERSTOCK','PROMO_BUMP','EXPIRY_GUARD','BULK_PRICE_BREAK','SLA_AWARE','TRANSIT_INFO','ANOMALY'
    );
  end if;
end $$;

-- If enums exist, ensure all UPPERCASE labels are present
do $$ begin
  if not exists (select 1 from pg_type where typname='suggestion_status') then
    create type suggestion_status as enum ('PENDING','ACCEPTED','EDITED','DISMISSED','SENT');
  else
    alter type suggestion_status add value if not exists 'PENDING';
    alter type suggestion_status add value if not exists 'ACCEPTED';
    alter type suggestion_status add value if not exists 'EDITED';
    alter type suggestion_status add value if not exists 'DISMISSED';
    alter type suggestion_status add value if not exists 'SENT';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='inquiry_status') then
    create type inquiry_status as enum ('DRAFT','SENT','ANSWER_RECORDED','CLOSED');
  else
    alter type inquiry_status add value if not exists 'DRAFT';
    alter type inquiry_status add value if not exists 'SENT';
    alter type inquiry_status add value if not exists 'ANSWER_RECORDED';
    alter type inquiry_status add value if not exists 'CLOSED';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='po_status') then
    create type po_status as enum ('DRAFT','DISPATCHED','ACKNOWLEDGED','CHANGE_PROPOSED','REJECTED','IN_TRANSIT','PARTIAL','DELIVERED','CLOSED');
  else
    alter type po_status add value if not exists 'DRAFT';
    alter type po_status add value if not exists 'DISPATCHED';
    alter type po_status add value if not exists 'ACKNOWLEDGED';
    alter type po_status add value if not exists 'CHANGE_PROPOSED';
    alter type po_status add value if not exists 'REJECTED';
    alter type po_status add value if not exists 'IN_TRANSIT';
    alter type po_status add value if not exists 'PARTIAL';
    alter type po_status add value if not exists 'DELIVERED';
    alter type po_status add value if not exists 'CLOSED';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='po_item_status') then
    create type po_item_status as enum ('OPEN','BACKORDERED','CANCELED','EXCHANGED');
  else
    alter type po_item_status add value if not exists 'OPEN';
    alter type po_item_status add value if not exists 'BACKORDERED';
    alter type po_item_status add value if not exists 'CANCELED';
    alter type po_item_status add value if not exists 'EXCHANGED';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='outbox_status') then
    create type outbox_status as enum ('QUEUED','SENT','FAILED');
  else
    alter type outbox_status add value if not exists 'QUEUED';
    alter type outbox_status add value if not exists 'SENT';
    alter type outbox_status add value if not exists 'FAILED';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='rel_binary') then
    create type rel_binary as enum ('AFTER','BEFORE');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='qty_relation') then
    create type qty_relation as enum ('LOWER_THAN','HIGHER_THAN');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='price_direction') then
    create type price_direction as enum ('UP','DOWN');
  end if;
end $$;
