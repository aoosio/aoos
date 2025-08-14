-- ===============================================================
-- AOOS — Supabase Phase 2
-- 01 — Core Tables (Auth mirrors, Orgs, Memberships, Suppliers, Products)
-- ===============================================================

-- Profiles (optional mirror of auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Memberships (org roles)
create table if not exists public.memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'po_manager',
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);

-- AOOS platform admins (support/debug)
create table if not exists public.aoos_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_by uuid references auth.users(id),
  added_at timestamptz default now()
);

-- Suppliers (per org)
create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text,
  distributor_phone text not null,
  created_at timestamptz default now(),
  unique (org_id, distributor_phone)
);

-- Product keys (hidden product_uuid per org + item_name; supplier is "current" and may be null)
create table if not exists public.product_keys (
  product_uuid uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  item_name text not null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz default now(),
  unique (org_id, item_name)
);
