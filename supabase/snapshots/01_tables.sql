CREATE TABLE public.platform_owners (
  user_id uuid NOT NULL,
  granted_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.org_members (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.platform_admins (
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.stock_uploads (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid DEFAULT current_org_id() NOT NULL,
  uploaded_by uuid DEFAULT auth.uid() NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
  product text NOT NULL,
  qty numeric NOT NULL,
  expiry_date date,
  distributor text,
  distributor_phone text,
  created_by uuid
);

CREATE TABLE public.sales_uploads (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid DEFAULT current_org_id() NOT NULL,
  uploaded_by uuid DEFAULT auth.uid() NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
  product text NOT NULL,
  sold_qty numeric NOT NULL,
  created_by uuid
);

CREATE TABLE public.stores (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  name text NOT NULL,
  city text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.platform_messages (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  from_user uuid,
  scope text NOT NULL,
  org_id uuid,
  user_id uuid,
  body text NOT NULL
);

CREATE TABLE public.supplier_contacts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  phone_e164 text NOT NULL,
  is_whatsapp boolean DEFAULT true,
  opted_in boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.members (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role member_role DEFAULT 'PO_MANAGER'::member_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  display_name text,
  phone_e164 text
);

CREATE TABLE public.organizations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  city text,
  timezone text DEFAULT 'Asia/Baghdad'::text,
  working_days integer[] DEFAULT '{1,2,3,4,5,6}'::integer[],
  default_cadence text DEFAULT 'WEEKLY'::text,
  created_at timestamp with time zone DEFAULT now(),
  default_language text DEFAULT 'ar'::text NOT NULL,
  ssi_days integer DEFAULT 14 NOT NULL,
  sla_target_days integer DEFAULT 3 NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  default_dial_code text DEFAULT '+964'::text NOT NULL
);

CREATE TABLE public.suppliers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid DEFAULT current_org_id() NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  preferred_language text DEFAULT 'ar'::text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  phone_e164 text,
  created_by uuid
);

CREATE TABLE public.reorder_prefs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  supplier_id uuid,
  product_id uuid,
  cadence text NOT NULL,
  day_of_week integer[],
  source text DEFAULT 'USER'::text NOT NULL,
  notes text,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.report_uploads (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  store_id uuid NOT NULL,
  kind report_kind NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
  filename text
);

CREATE TABLE public.sales_rows (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  upload_id uuid NOT NULL,
  org_id uuid NOT NULL,
  store_id uuid NOT NULL,
  product_id uuid NOT NULL,
  sold_qty numeric NOT NULL,
  recorded_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.inventory_snapshots (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  upload_id uuid NOT NULL,
  org_id uuid NOT NULL,
  store_id uuid NOT NULL,
  product_id uuid NOT NULL,
  supplier_id uuid,
  supplier_phone text,
  qty numeric NOT NULL,
  expiry_date date,
  recorded_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.purchase_order_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  po_id uuid NOT NULL,
  product_id uuid NOT NULL,
  qty integer NOT NULL,
  unit_price numeric,
  status po_item_status DEFAULT 'OPEN'::po_item_status
);

CREATE TABLE public.channel_whatsapp (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  phone_number_id text NOT NULL,
  waba_id text NOT NULL,
  token_masked text,
  is_connected boolean DEFAULT false,
  last_test_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  connect_method text DEFAULT 'MANUAL'::text NOT NULL,
  token_encrypted text,
  token_hint text,
  connected_display_name text,
  template_count integer DEFAULT 0 NOT NULL,
  last_template_sync timestamp with time zone,
  last_error text,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.inquiries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  suggestion_id uuid,
  type suggestion_subtype NOT NULL,
  to_phone text NOT NULL,
  template_name text NOT NULL,
  variables jsonb NOT NULL,
  status inquiry_status DEFAULT 'DRAFT'::inquiry_status,
  answer_bool boolean,
  answer_discount boolean,
  answer_price_direction price_direction,
  answer_date_relation rel_binary,
  answer_date date,
  answer_qty_relation qty_relation,
  answer_qty_threshold numeric,
  answered_by uuid,
  answered_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  template_id uuid,
  note text,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.message_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  key text NOT NULL,
  language_code text DEFAULT 'en'::text NOT NULL,
  meta_template_name text NOT NULL,
  category text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb NOT NULL,
  status text DEFAULT 'ACTIVE'::text NOT NULL,
  needs_meta_approval boolean DEFAULT false,
  version integer DEFAULT 1 NOT NULL,
  facts_config jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  barcode text NOT NULL,
  name text,
  pack_size integer DEFAULT 1,
  moq integer DEFAULT 0,
  lead_time_days integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  store_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  po_number text NOT NULL,
  status po_status DEFAULT 'DRAFT'::po_status NOT NULL,
  to_phone text,
  totals numeric DEFAULT 0,
  promised_date date,
  acknowledged_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  note text,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.audit_log (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid DEFAULT current_org_id() NOT NULL,
  actor uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  meta jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.suggestions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  store_id uuid NOT NULL,
  supplier_id uuid,
  product_id uuid,
  kind suggestion_kind NOT NULL,
  subtype suggestion_subtype NOT NULL,
  reason text,
  recommended_qty integer,
  payload jsonb DEFAULT '{}'::jsonb,
  status suggestion_status DEFAULT 'PENDING'::suggestion_status NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.whatsapp_remote_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  waba_template_name text NOT NULL,
  language_code text NOT NULL,
  category text,
  status text,
  quality text,
  body text,
  variables jsonb DEFAULT '[]'::jsonb,
  last_synced_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.whatsapp_outbox (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  org_id uuid NOT NULL,
  to_phone text NOT NULL,
  template_name text NOT NULL,
  payload jsonb NOT NULL,
  api_response jsonb,
  status outbox_status DEFAULT 'QUEUED'::outbox_status,
  created_at timestamp with time zone DEFAULT now(),
  template_id uuid,
  rendered_text text,
  ref_po_id uuid,
  ref_inquiry_id uuid,
  channel_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  provider_message_id text,
  provider_status text,
  error_code text,
  error_title text,
  error_details text,
  attempt_count integer DEFAULT 0 NOT NULL,
  last_attempt_at timestamp with time zone,
  next_attempt_at timestamp with time zone,
  created_by uuid
);

CREATE TABLE public.admin_message_replies (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  message_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL
);

CREATE TABLE public.admin_messages (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  sent_by uuid NOT NULL,
  org_id uuid,
  subject text,
  body text NOT NULL,
  audience text DEFAULT 'all'::text NOT NULL
);
