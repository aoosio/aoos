AOOS — Supabase Phase 2 — SQL Pack
==================================
Date: 20250814_1409 (UTC)

What’s inside
-------------
00_AOOS_EXTENSIONS_AND_SETUP.sql           — Enable extensions + enums
01_AOOS_CORE_TABLES.sql                    — Orgs, memberships, aoos_admins, suppliers, product_keys
02_AOOS_UPLOADS_AND_FACTS.sql              — uploads, staging tables, stock_eod, sales_daily
03_AOOS_RULES_SETTINGS_AND_ORDERS.sql      — org_settings, product_rules, suggestions, POs, audit_log
04_AOOS_INDEXES_AND_VIEWS.sql              — helpful indexes + v_sales_weekly / v_sales_monthly
05_AOOS_RLS_AND_POLICIES.sql               — RLS enablement + policies (including AOOS admin bypass)
06_AOOS_FUNCTIONS_AND_TRIGGERS.sql         — ingest functions, metrics helpers, audit triggers
07_AOOS_SUGGESTIONS_ENGINE.sql             — generate_suggestions_for_date(_org, _ref)
08_AOOS_OPTIONAL_SEEDS.sql                 — optional seed helpers

Execution order
---------------
1) Run 00_AOOS_EXTENSIONS_AND_SETUP.sql
2) Run 01_AOOS_CORE_TABLES.sql
3) Run 02_AOOS_UPLOADS_AND_FACTS.sql
4) Run 03_AOOS_RULES_SETTINGS_AND_ORDERS.sql
5) Run 04_AOOS_INDEXES_AND_VIEWS.sql
6) Run 05_AOOS_RLS_AND_POLICIES.sql
7) Run 06_AOOS_FUNCTIONS_AND_TRIGGERS.sql
8) Run 07_AOOS_SUGGESTIONS_ENGINE.sql
9) (Optional) 08_AOOS_OPTIONAL_SEEDS.sql

Click-by-click (Supabase Studio)
--------------------------------
• Open Supabase Studio → SQL Editor
• For each file above: paste its contents → Run
• Table Editor → confirm tables exist
• (Optional) run seeds with your user id (from auth.users)

Notes
-----
• RLS: Members can read; Owner/Admin can manage settings; PO Managers can upload CSVs,
  create POs, and act on suggestions.
• AOOS Admins: add support users to public.aoos_admins to bypass tenant restrictions for support.
• Suggestions engine: call
    select public.generate_suggestions_for_date('<ORG_ID>', '2025-08-14'::date);
  then check public.suggestions table for badges.
