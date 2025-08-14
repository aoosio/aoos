-- ===============================================================
-- AOOS — Supabase Phase 2
-- 08 — Optional Seeds (for quick smoke tests)
-- ===============================================================
-- Replace <YOUR_USER_ID> with your auth.users.id if you want to seed an org.
-- SELECT id,email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- insert into public.organizations(name, created_by) values ('Demo Market', '<YOUR_USER_ID>') returning id;
-- insert into public.memberships(org_id, user_id, role) values ('<ORG_ID>', '<YOUR_USER_ID>', 'owner');
-- insert into public.org_settings(org_id) values ('<ORG_ID>');

-- Example lead times (optional)
-- insert into public.lead_times(org_id, product_uuid, days) values ('<ORG_ID>', '<PRODUCT_UUID>', 5);
