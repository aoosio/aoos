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

ALTER TABLE public.platform_owners ADD CONSTRAINT platform_owners_pkey PRIMARY KEY (user_id);
ALTER TABLE public.platform_owners ADD CONSTRAINT platform_owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.org_members ADD CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.org_members ADD CONSTRAINT org_members_pkey PRIMARY KEY (org_id, user_id);
ALTER TABLE public.org_members ADD CONSTRAINT org_members_role_check CHECK (role = ANY (ARRAY['admin'::text, 'po_manager'::text]));
ALTER TABLE public.org_members ADD CONSTRAINT org_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.platform_admins ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (user_id);
ALTER TABLE public.platform_admins ADD CONSTRAINT platform_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stock_uploads ADD CONSTRAINT stock_uploads_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.stock_uploads ADD CONSTRAINT stock_uploads_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_uploads ADD CONSTRAINT stock_uploads_qty_check CHECK (qty >= 0::numeric);
ALTER TABLE public.sales_uploads ADD CONSTRAINT sales_uploads_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.sales_uploads ADD CONSTRAINT sales_uploads_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_uploads ADD CONSTRAINT sales_uploads_sold_qty_check CHECK (sold_qty >= 0::numeric);
ALTER TABLE public.stores ADD CONSTRAINT stores_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.stores ADD CONSTRAINT stores_pkey PRIMARY KEY (id);
ALTER TABLE public.platform_messages ADD CONSTRAINT platform_messages_from_user_fkey FOREIGN KEY (from_user) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.platform_messages ADD CONSTRAINT platform_messages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.platform_messages ADD CONSTRAINT platform_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.platform_messages ADD CONSTRAINT platform_messages_scope_check CHECK (scope = ANY (ARRAY['all'::text, 'owners'::text, 'po_managers'::text, 'org'::text, 'user'::text]));
ALTER TABLE public.platform_messages ADD CONSTRAINT platform_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.supplier_contacts ADD CONSTRAINT chk_supplier_contacts_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$'::text);
ALTER TABLE public.supplier_contacts ADD CONSTRAINT supplier_contacts_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.supplier_contacts ADD CONSTRAINT supplier_contacts_org_id_phone_e164_key UNIQUE (org_id, phone_e164);
ALTER TABLE public.supplier_contacts ADD CONSTRAINT supplier_contacts_pkey PRIMARY KEY (id);
ALTER TABLE public.supplier_contacts ADD CONSTRAINT supplier_contacts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.members ADD CONSTRAINT chk_members_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$'::text);
ALTER TABLE public.members ADD CONSTRAINT members_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.members ADD CONSTRAINT members_org_id_user_id_key UNIQUE (org_id, user_id);
ALTER TABLE public.members ADD CONSTRAINT members_pkey PRIMARY KEY (id);
ALTER TABLE public.members ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_org_fk FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_phone_e164_chk CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$'::text);
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_phone_e164_format CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$'::text);
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);
ALTER TABLE public.reorder_prefs ADD CONSTRAINT reorder_prefs_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.reorder_prefs ADD CONSTRAINT reorder_prefs_pkey PRIMARY KEY (id);
ALTER TABLE public.reorder_prefs ADD CONSTRAINT reorder_prefs_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE public.reorder_prefs ADD CONSTRAINT reorder_prefs_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.reorder_prefs ADD CONSTRAINT reorder_prefs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
ALTER TABLE public.report_uploads ADD CONSTRAINT report_uploads_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.report_uploads ADD CONSTRAINT report_uploads_pkey PRIMARY KEY (id);
ALTER TABLE public.report_uploads ADD CONSTRAINT report_uploads_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE public.report_uploads ADD CONSTRAINT report_uploads_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);
ALTER TABLE public.sales_rows ADD CONSTRAINT sales_rows_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.sales_rows ADD CONSTRAINT sales_rows_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_rows ADD CONSTRAINT sales_rows_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_rows ADD CONSTRAINT sales_rows_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE public.sales_rows ADD CONSTRAINT sales_rows_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES report_uploads(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_snapshots ADD CONSTRAINT inventory_snapshots_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES report_uploads(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
ALTER TABLE public.channel_whatsapp ADD CONSTRAINT channel_whatsapp_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.channel_whatsapp ADD CONSTRAINT channel_whatsapp_org_id_key UNIQUE (org_id);
ALTER TABLE public.channel_whatsapp ADD CONSTRAINT channel_whatsapp_pkey PRIMARY KEY (id);
ALTER TABLE public.channel_whatsapp ADD CONSTRAINT chk_channel_connect_method CHECK (connect_method = ANY (ARRAY['MANUAL'::text, 'EMBEDDED'::text]));
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_answered_by_fkey FOREIGN KEY (answered_by) REFERENCES auth.users(id);
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE SET NULL;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_template_id_fkey FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL;
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_org_id_key_language_code_version_key UNIQUE (org_id, key, language_code, version);
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
ALTER TABLE public.products ADD CONSTRAINT products_org_id_barcode_key UNIQUE (org_id, barcode);
ALTER TABLE public.products ADD CONSTRAINT products_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_org_id_po_number_key UNIQUE (org_id, po_number);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_actor_fkey FOREIGN KEY (actor) REFERENCES auth.users(id);
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_status_canon CHECK (status = ANY (ARRAY['PENDING'::suggestion_status, 'SENT'::suggestion_status, 'ACCEPTED'::suggestion_status, 'EDITED'::suggestion_status, 'DISMISSED'::suggestion_status]));
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_remote_templates ADD CONSTRAINT whatsapp_remote_templates_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.whatsapp_remote_templates ADD CONSTRAINT whatsapp_remote_templates_org_id_waba_template_name_languag_key UNIQUE (org_id, waba_template_name, language_code);
ALTER TABLE public.whatsapp_remote_templates ADD CONSTRAINT whatsapp_remote_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES channel_whatsapp(id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_pkey PRIMARY KEY (id);
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_ref_inquiry_id_fkey FOREIGN KEY (ref_inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_ref_po_id_fkey FOREIGN KEY (ref_po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_outbox ADD CONSTRAINT whatsapp_outbox_template_id_fkey FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL;
ALTER TABLE public.admin_message_replies ADD CONSTRAINT admin_message_replies_message_id_fkey FOREIGN KEY (message_id) REFERENCES admin_messages(id) ON DELETE CASCADE;
ALTER TABLE public.admin_message_replies ADD CONSTRAINT admin_message_replies_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_message_replies ADD CONSTRAINT admin_message_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_audience_check CHECK (audience = ANY (ARRAY['all'::text, 'org'::text]));
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users(id) ON DELETE SET NULL;


CREATE INDEX suppliers_phone_idx ON public.suppliers USING btree (phone_e164);
CREATE INDEX idx_outbox_channel_time ON public.whatsapp_outbox USING btree (channel_id, created_at DESC);
CREATE INDEX idx_sales_rows_product ON public.sales_rows USING btree (product_id);
CREATE INDEX idx_audit_org_time ON public.audit_log USING btree (org_id, created_at DESC);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders USING btree (org_id, status);
CREATE INDEX idx_suggestions_org ON public.suggestions USING btree (org_id);
CREATE INDEX idx_pos_delivered_at ON public.purchase_orders USING btree (delivered_at);
CREATE INDEX ix_sales_uploads_org_time ON public.sales_uploads USING btree (org_id, uploaded_at DESC);
CREATE INDEX idx_outbox_status_next_attempt ON public.whatsapp_outbox USING btree (status, next_attempt_at, created_at);
CREATE INDEX idx_inquiries_supplier ON public.inquiries USING btree (org_id, supplier_id, status);
CREATE INDEX idx_suggestions_scope ON public.suggestions USING btree (org_id, store_id, supplier_id, product_id);
CREATE INDEX idx_suggestions_pending ON public.suggestions USING btree (org_id, created_at DESC) WHERE (status = 'PENDING'::suggestion_status);
CREATE INDEX idx_suggestions_status ON public.suggestions USING btree (status);
CREATE INDEX idx_inventory_snapshots_recorded_at ON public.inventory_snapshots USING btree (recorded_at);
CREATE INDEX idx_poi_po ON public.purchase_order_items USING btree (po_id);
CREATE UNIQUE INDEX uq_channel_whatsapp_phone ON public.channel_whatsapp USING btree (phone_number_id);
CREATE INDEX idx_audit_created ON public.audit_log USING btree (created_at);
CREATE INDEX admin_messages_org_id_idx ON public.admin_messages USING btree (org_id);
CREATE INDEX idx_inventory_snapshots_product ON public.inventory_snapshots USING btree (product_id);
CREATE INDEX idx_outbox_org_time ON public.whatsapp_outbox USING btree (org_id, created_at DESC);
CREATE INDEX ix_stock_uploads_org_time ON public.stock_uploads USING btree (org_id, uploaded_at DESC);
CREATE INDEX idx_sales_rows_recorded_at ON public.sales_rows USING btree (recorded_at);
CREATE INDEX idx_outbox_status_created ON public.whatsapp_outbox USING btree (status, created_at);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_remote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read all members" ON public.org_members FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY "members view" ON public.org_members FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members_1.org_id
   FROM org_members org_members_1
  WHERE (org_members_1.user_id = auth.uid()))));
CREATE POLICY "org members can view members" ON public.org_members FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members_1.org_id
   FROM org_members org_members_1
  WHERE (org_members_1.user_id = auth.uid()))));
CREATE POLICY "owners delete members" ON public.org_members FOR DELETE TO PUBLIC USING (is_org_owner(org_id));
CREATE POLICY "owners insert members" ON public.org_members FOR INSERT TO PUBLIC WITH CHECK (is_org_owner(org_id));
CREATE POLICY "owners manage members - delete" ON public.org_members FOR DELETE TO PUBLIC USING (is_org_owner(org_id));
CREATE POLICY "owners manage members - insert" ON public.org_members FOR INSERT TO PUBLIC WITH CHECK (is_org_owner(org_id));
CREATE POLICY "owners manage members - update" ON public.org_members FOR UPDATE TO PUBLIC USING (is_org_owner(org_id)) WITH CHECK (is_org_owner(org_id));
CREATE POLICY "owners update members" ON public.org_members FOR UPDATE TO PUBLIC USING (is_org_owner(org_id)) WITH CHECK (is_org_owner(org_id));
CREATE POLICY "platform_admins delete" ON public.platform_admins FOR DELETE TO PUBLIC USING (is_platform_admin());
CREATE POLICY "platform_admins manage" ON public.platform_admins FOR INSERT TO PUBLIC WITH CHECK (is_platform_admin());
CREATE POLICY "platform_admins select" ON public.platform_admins FOR SELECT TO PUBLIC USING (((auth.uid() = user_id) OR is_platform_admin()));
CREATE POLICY "self can read" ON public.platform_admins FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
CREATE POLICY "members read stock_uploads" ON public.stock_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "members write stock_uploads" ON public.stock_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY st_insert ON public.stock_uploads FOR INSERT TO PUBLIC WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY st_select ON public.stock_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY "stock insert" ON public.stock_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "stock insert by members" ON public.stock_uploads FOR INSERT TO PUBLIC WITH CHECK (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = stock_uploads.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin()));
CREATE POLICY "stock read in org" ON public.stock_uploads FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = stock_uploads.org_id) AND (om.user_id = auth.uid())))) OR is_platform_admin()));
CREATE POLICY "stock select" ON public.stock_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY stock_ins ON public.stock_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id = current_org_id()));
CREATE POLICY stock_ins_own_org ON public.stock_uploads FOR INSERT TO authenticated WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY stock_insert ON public.stock_uploads FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = stock_uploads.org_id) AND (m.user_id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::text, 'po_manager'::text]))))));
CREATE POLICY stock_sel ON public.stock_uploads FOR SELECT TO PUBLIC USING ((org_id = current_org_id()));
CREATE POLICY stock_sel_own_org ON public.stock_uploads FOR SELECT TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY stock_select ON public.stock_uploads FOR SELECT TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "members read sales_uploads" ON public.sales_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "members write sales_uploads" ON public.sales_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "sales insert" ON public.sales_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "sales insert by members" ON public.sales_uploads FOR INSERT TO PUBLIC WITH CHECK (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = sales_uploads.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin()));
CREATE POLICY "sales read in org" ON public.sales_uploads FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = sales_uploads.org_id) AND (om.user_id = auth.uid())))) OR is_platform_admin()));
CREATE POLICY "sales select" ON public.sales_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY sales_ins ON public.sales_uploads FOR INSERT TO PUBLIC WITH CHECK ((org_id = current_org_id()));
CREATE POLICY sales_ins_own_org ON public.sales_uploads FOR INSERT TO authenticated WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY sales_insert ON public.sales_uploads FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = sales_uploads.org_id) AND (m.user_id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::text, 'po_manager'::text]))))));
CREATE POLICY sales_sel ON public.sales_uploads FOR SELECT TO PUBLIC USING ((org_id = current_org_id()));
CREATE POLICY sales_sel_own_org ON public.sales_uploads FOR SELECT TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY sales_select ON public.sales_uploads FOR SELECT TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY su_insert ON public.sales_uploads FOR INSERT TO PUBLIC WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY su_select ON public.sales_uploads FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY org_table_delete_stores ON public.stores FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_stores ON public.stores FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_stores ON public.stores FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_stores ON public.stores FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "admin full" ON public.platform_messages FOR ALL TO PUBLIC USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "members read targeted" ON public.platform_messages FOR SELECT TO PUBLIC USING (((scope = 'all'::text) OR ((scope = 'owners'::text) AND (EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.user_id = auth.uid()) AND (om.role = 'owner'::text))))) OR ((scope = 'po_managers'::text) AND (EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.user_id = auth.uid()) AND (om.role = 'po_manager'::text))))) OR ((scope = 'org'::text) AND (EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.user_id = auth.uid()) AND (om.org_id = platform_messages.org_id))))) OR ((scope = 'user'::text) AND (user_id = auth.uid()))));
CREATE POLICY org_table_delete_supplier_contacts ON public.supplier_contacts FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_supplier_contacts ON public.supplier_contacts FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_supplier_contacts ON public.supplier_contacts FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_supplier_contacts ON public.supplier_contacts FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY members_delete_owner ON public.members FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY members_insert_owner ON public.members FOR INSERT TO authenticated WITH CHECK (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY members_select ON public.members FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY members_update_owner ON public.members FOR UPDATE TO authenticated USING (has_role(org_id, 'OWNER'::member_role)) WITH CHECK (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY "admin read all orgs" ON public.organizations FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY org_insert ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY org_sel_by_members ON public.organizations FOR SELECT TO authenticated USING ((id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY org_select ON public.organizations FOR SELECT TO authenticated USING (is_org_member(id));
CREATE POLICY org_update ON public.organizations FOR UPDATE TO authenticated USING ((is_org_member(id) AND has_role(id, 'OWNER'::member_role))) WITH CHECK ((is_org_member(id) AND has_role(id, 'OWNER'::member_role)));
CREATE POLICY org_update_by_owner ON public.organizations FOR UPDATE TO authenticated USING ((id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active AND (org_members.role = 'OWNER'::text))))) WITH CHECK ((id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active AND (org_members.role = 'OWNER'::text)))));
CREATE POLICY organizations_select_admin ON public.organizations FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = auth.uid()))) OR (id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid())))));
CREATE POLICY organizations_update_by_owner ON public.organizations FOR UPDATE TO PUBLIC USING ((id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text])))))) WITH CHECK ((id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text]))))));
CREATE POLICY "orgs read" ON public.organizations FOR SELECT TO PUBLIC USING ((is_platform_admin() OR (id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid())))));
CREATE POLICY "members insert suppliers" ON public.suppliers FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "members select suppliers" ON public.suppliers FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "members update suppliers" ON public.suppliers FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid())))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY org_table_delete_suppliers ON public.suppliers FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_suppliers ON public.suppliers FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_suppliers ON public.suppliers FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_suppliers ON public.suppliers FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "owner delete" ON public.suppliers FOR DELETE TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = suppliers.org_id) AND (om.user_id = auth.uid()) AND (om.role = 'owner'::text)))) OR is_platform_admin()));
CREATE POLICY "read in org" ON public.suppliers FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = suppliers.org_id) AND (om.user_id = auth.uid())))) OR is_platform_admin()));
CREATE POLICY sup_del ON public.suppliers FOR DELETE TO PUBLIC USING ((org_id = current_org_id()));
CREATE POLICY sup_ins ON public.suppliers FOR INSERT TO PUBLIC WITH CHECK ((org_id = current_org_id()));
CREATE POLICY sup_sel ON public.suppliers FOR SELECT TO PUBLIC USING ((org_id = current_org_id()));
CREATE POLICY sup_upd ON public.suppliers FOR UPDATE TO PUBLIC USING ((org_id = current_org_id())) WITH CHECK ((org_id = current_org_id()));
CREATE POLICY "suppliers insert" ON public.suppliers FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "suppliers select" ON public.suppliers FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY "suppliers update" ON public.suppliers FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid())))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid()))));
CREATE POLICY suppliers_delete ON public.suppliers FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = suppliers.org_id) AND (m.user_id = auth.uid()) AND (m.role = 'admin'::text)))));
CREATE POLICY suppliers_ins_own_org ON public.suppliers FOR INSERT TO authenticated WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY suppliers_insert ON public.suppliers FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = suppliers.org_id) AND (m.user_id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::text, 'po_manager'::text]))))));
CREATE POLICY suppliers_insert_own_org ON public.suppliers FOR INSERT TO PUBLIC WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY suppliers_sel_own_org ON public.suppliers FOR SELECT TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY suppliers_select ON public.suppliers FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = suppliers.org_id) AND (m.user_id = auth.uid())))));
CREATE POLICY suppliers_select_own ON public.suppliers FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY suppliers_upd_own_org ON public.suppliers FOR UPDATE TO authenticated USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active)))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY suppliers_update ON public.suppliers FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = suppliers.org_id) AND (m.user_id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::text, 'po_manager'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members m
  WHERE ((m.org_id = suppliers.org_id) AND (m.user_id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::text, 'po_manager'::text]))))));
CREATE POLICY suppliers_update_own_org ON public.suppliers FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active)))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY "update by members" ON public.suppliers FOR UPDATE TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = suppliers.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin())) WITH CHECK (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = suppliers.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin()));
CREATE POLICY "upsert by members" ON public.suppliers FOR INSERT TO PUBLIC WITH CHECK (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = suppliers.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin()));
CREATE POLICY org_table_delete_reorder_prefs ON public.reorder_prefs FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_reorder_prefs ON public.reorder_prefs FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_reorder_prefs ON public.reorder_prefs FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_reorder_prefs ON public.reorder_prefs FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_delete_report_uploads ON public.report_uploads FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_report_uploads ON public.report_uploads FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_report_uploads ON public.report_uploads FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_report_uploads ON public.report_uploads FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_delete_sales_rows ON public.sales_rows FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_sales_rows ON public.sales_rows FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_sales_rows ON public.sales_rows FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_sales_rows ON public.sales_rows FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_delete_inventory_snapshots ON public.inventory_snapshots FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_inventory_snapshots ON public.inventory_snapshots FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_inventory_snapshots ON public.inventory_snapshots FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_inventory_snapshots ON public.inventory_snapshots FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_delete_purchase_order_items ON public.purchase_order_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.po_id) AND has_role(po.org_id, 'OWNER'::member_role)))));
CREATE POLICY org_table_insert_purchase_order_items ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.po_id) AND is_org_member(po.org_id)))));
CREATE POLICY org_table_select_purchase_order_items ON public.purchase_order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.po_id) AND is_org_member(po.org_id)))));
CREATE POLICY org_table_update_purchase_order_items ON public.purchase_order_items FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.po_id) AND is_org_member(po.org_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.po_id) AND is_org_member(po.org_id)))));
CREATE POLICY cw_insert_owner ON public.channel_whatsapp FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text]))))));
CREATE POLICY cw_select ON public.channel_whatsapp FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY cw_update_owner ON public.channel_whatsapp FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text])))))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text]))))));
CREATE POLICY org_table_delete_channel_whatsapp ON public.channel_whatsapp FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_channel_whatsapp ON public.channel_whatsapp FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_channel_whatsapp ON public.channel_whatsapp FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_channel_whatsapp ON public.channel_whatsapp FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_delete_inquiries ON public.inquiries FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_inquiries ON public.inquiries FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_inquiries ON public.inquiries FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_inquiries ON public.inquiries FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY msgtpl_delete ON public.message_templates FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY msgtpl_insert ON public.message_templates FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY msgtpl_select ON public.message_templates FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY msgtpl_update ON public.message_templates FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY mt_select ON public.message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY mt_write ON public.message_templates FOR ALL TO authenticated USING (is_platform_owner()) WITH CHECK (is_platform_owner());
CREATE POLICY tpl_insert_owner ON public.message_templates FOR INSERT TO PUBLIC WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text]))))));
CREATE POLICY tpl_select ON public.message_templates FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY tpl_update_owner ON public.message_templates FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text])))))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND (org_members.role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text]))))));
CREATE POLICY org_table_delete_products ON public.products FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_products ON public.products FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_products ON public.products FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_products ON public.products FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "admin read all po" ON public.purchase_orders FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY org_table_delete_purchase_orders ON public.purchase_orders FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_purchase_orders ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_purchase_orders ON public.purchase_orders FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_purchase_orders ON public.purchase_orders FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "admin read all audit" ON public.audit_log FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY audit_insert ON public.audit_log FOR INSERT TO PUBLIC WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY audit_select ON public.audit_log FOR SELECT TO PUBLIC USING (((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))) OR (EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = auth.uid())))));
CREATE POLICY org_table_delete_audit_log ON public.audit_log FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_audit_log ON public.audit_log FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_audit_log ON public.audit_log FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_audit_log ON public.audit_log FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "admin read all sug" ON public.suggestions FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY org_table_delete_suggestions ON public.suggestions FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_suggestions ON public.suggestions FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_suggestions ON public.suggestions FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_suggestions ON public.suggestions FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY wrt_delete ON public.whatsapp_remote_templates FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY wrt_select ON public.whatsapp_remote_templates FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY wrt_update ON public.whatsapp_remote_templates FOR UPDATE TO authenticated USING (has_role(org_id, 'OWNER'::member_role)) WITH CHECK (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY wrt_upsert ON public.whatsapp_remote_templates FOR INSERT TO authenticated WITH CHECK (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_delete_whatsapp_outbox ON public.whatsapp_outbox FOR DELETE TO authenticated USING (has_role(org_id, 'OWNER'::member_role));
CREATE POLICY org_table_insert_whatsapp_outbox ON public.whatsapp_outbox FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id));
CREATE POLICY org_table_select_whatsapp_outbox ON public.whatsapp_outbox FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY org_table_update_whatsapp_outbox ON public.whatsapp_outbox FOR UPDATE TO authenticated USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));
CREATE POLICY "outbox insert by members" ON public.whatsapp_outbox FOR INSERT TO PUBLIC WITH CHECK (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = whatsapp_outbox.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'po_manager'::text]))))) OR is_platform_admin()));
CREATE POLICY "outbox read in org" ON public.whatsapp_outbox FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.org_id = whatsapp_outbox.org_id) AND (om.user_id = auth.uid())))) OR is_platform_admin()));
CREATE POLICY wout_insert_member ON public.whatsapp_outbox FOR INSERT TO PUBLIC WITH CHECK ((COALESCE(org_id, current_org_id()) IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY wout_select ON public.whatsapp_outbox FOR SELECT TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY wout_update_member ON public.whatsapp_outbox FOR UPDATE TO PUBLIC USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active)))) WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE ((org_members.user_id = auth.uid()) AND org_members.is_active))));
CREATE POLICY "admins read all replies" ON public.admin_message_replies FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY "reply insert if message visible" ON public.admin_message_replies FOR INSERT TO PUBLIC WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM admin_messages m
  WHERE ((m.id = admin_message_replies.message_id) AND ((m.org_id IS NULL) OR (m.org_id IN ( SELECT org_members.org_id
           FROM org_members
          WHERE (org_members.user_id = auth.uid())))))))));
CREATE POLICY "reply select if message visible" ON public.admin_message_replies FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM admin_messages m
  WHERE ((m.id = admin_message_replies.message_id) AND ((m.org_id IS NULL) OR (m.org_id IN ( SELECT org_members.org_id
           FROM org_members
          WHERE (org_members.user_id = auth.uid()))))))));
CREATE POLICY "admins all" ON public.admin_messages FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM platform_admins a
  WHERE (a.user_id = auth.uid())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM platform_admins a
  WHERE (a.user_id = auth.uid()))));
CREATE POLICY "admins read messages" ON public.admin_messages FOR SELECT TO PUBLIC USING (is_platform_admin());
CREATE POLICY "admins write messages" ON public.admin_messages FOR INSERT TO PUBLIC WITH CHECK (is_platform_admin());
CREATE POLICY "members read messages" ON public.admin_messages FOR SELECT TO PUBLIC USING (((org_id IS NULL) OR (org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = auth.uid())))));
CREATE POLICY "org users read" ON public.admin_messages FOR SELECT TO PUBLIC USING (((audience = 'all'::text) OR ((audience = 'org'::text) AND (EXISTS ( SELECT 1
   FROM org_members om
  WHERE ((om.user_id = auth.uid()) AND (om.org_id = om.org_id) AND COALESCE(om.is_active, true)))))));

  CREATE OR REPLACE VIEW public.admin_v_stats AS  SELECT ( SELECT count(*) AS count
           FROM organizations) AS total_orgs,
    ( SELECT count(*) AS count
           FROM org_members
          WHERE org_members.role = 'owner'::text) AS owners,
    ( SELECT count(*) AS count
           FROM org_members
          WHERE org_members.role = 'po_manager'::text) AS po_managers,
    ( SELECT count(*) AS count
           FROM purchase_orders) AS po_total,
    ( SELECT count(*) AS count
           FROM purchase_orders
          WHERE purchase_orders.delivered_at IS NULL) AS po_open,
    ( SELECT count(*) AS count
           FROM purchase_orders
          WHERE purchase_orders.delivered_at > (now() - '30 days'::interval)) AS po_delivered_30d,
    ( SELECT count(*) AS count
           FROM suggestions) AS suggestions_total,
    ( SELECT count(*) AS count
           FROM suggestions
          WHERE _status_bucket(suggestions.status::text) = 'accepted'::text) AS suggestions_accepted,
    ( SELECT COALESCE(sum(suggestions.recommended_qty), 0::bigint) AS "coalesce"
           FROM suggestions
          WHERE _status_bucket(suggestions.status::text) = 'accepted'::text) AS accepted_qty,
    ( SELECT count(*) AS count
           FROM whatsapp_outbox
          WHERE whatsapp_outbox.status = 'FAILED'::outbox_status AND whatsapp_outbox.created_at > (now() - '30 days'::interval)) AS failed_sends_30d,
    ( SELECT count(*) AS count
           FROM audit_log
          WHERE audit_log.action ~~* 'ERROR%'::text AND audit_log.created_at > (now() - '30 days'::interval)) AS errors_30d,
    ( SELECT count(DISTINCT u.org_id) AS count
           FROM ( SELECT purchase_orders.org_id,
                    max(purchase_orders.created_at) AS last
                   FROM purchase_orders
                  GROUP BY purchase_orders.org_id
                UNION ALL
                 SELECT suggestions.org_id,
                    max(suggestions.created_at) AS max
                   FROM suggestions
                  GROUP BY suggestions.org_id
                UNION ALL
                 SELECT whatsapp_outbox.org_id,
                    max(whatsapp_outbox.created_at) AS max
                   FROM whatsapp_outbox
                  GROUP BY whatsapp_outbox.org_id) u
          WHERE u.last > (now() - '30 days'::interval)) AS active_orgs_30d;;

CREATE OR REPLACE VIEW public.admin_v_orgs AS  SELECT id AS org_id,
    ( SELECT count(*) AS count
           FROM org_members m
          WHERE m.org_id = o.id AND m.role = 'owner'::text) AS owners,
    ( SELECT count(*) AS count
           FROM org_members m
          WHERE m.org_id = o.id AND m.role = 'po_manager'::text) AS po_managers,
    ( SELECT count(*) AS count
           FROM purchase_orders p
          WHERE p.org_id = o.id) AS po_total,
    ( SELECT count(*) AS count
           FROM purchase_orders p
          WHERE p.org_id = o.id AND p.delivered_at IS NULL) AS po_open,
    ( SELECT count(*) AS count
           FROM suggestions s
          WHERE s.org_id = o.id) AS suggestions_total,
    ( SELECT count(*) AS count
           FROM suggestions s
          WHERE s.org_id = o.id AND _status_bucket(s.status::text) = 'accepted'::text) AS suggestions_accepted,
    ( SELECT COALESCE(sum(s.recommended_qty), 0::bigint) AS "coalesce"
           FROM suggestions s
          WHERE s.org_id = o.id AND _status_bucket(s.status::text) = 'accepted'::text) AS accepted_qty,
    ( SELECT count(*) AS count
           FROM whatsapp_outbox w
          WHERE w.org_id = o.id AND w.status = 'FAILED'::outbox_status AND w.created_at > (now() - '30 days'::interval)) AS failed_sends_30d
   FROM organizations o;;

CREATE OR REPLACE VIEW public.v_template_match AS  SELECT mt.org_id,
    mt.key,
    mt.language_code,
    mt.meta_template_name,
    COALESCE(wrt.status, 'MISSING'::text) AS remote_status,
    wrt.waba_template_name IS NOT NULL AS exists_remote,
    mt.status AS local_status
   FROM message_templates mt
     LEFT JOIN whatsapp_remote_templates wrt ON wrt.org_id = mt.org_id AND wrt.waba_template_name = mt.meta_template_name AND wrt.language_code = mt.language_code;;

CREATE OR REPLACE VIEW public.v_whatsapp_queue AS  SELECT wo.id,
    wo.org_id,
    wo.channel_id,
    wo.template_id,
    wo.to_phone,
    wo.status,
    wo.created_at,
    wo.next_attempt_at,
    cw.phone_number_id,
    cw.waba_id
   FROM whatsapp_outbox wo
     JOIN channel_whatsapp cw ON cw.id = wo.channel_id
  WHERE wo.status = 'QUEUED'::outbox_status
  ORDER BY (COALESCE(wo.next_attempt_at, wo.created_at)), wo.created_at;;

CREATE OR REPLACE VIEW public.v_org_whatsapp_readiness AS  WITH missing AS (
         SELECT v_template_match.org_id,
            count(*) AS missing_templates
           FROM v_template_match
          WHERE v_template_match.exists_remote = false AND v_template_match.local_status = 'ACTIVE'::text
          GROUP BY v_template_match.org_id
        )
 SELECT o.id AS org_id,
    o.name AS org_name,
    cw.is_connected,
    cw.phone_number_id IS NOT NULL AS has_phone_id,
    cw.token_encrypted IS NOT NULL AS has_token,
    COALESCE(m.missing_templates, 0::bigint) AS missing_templates,
    cw.is_connected AND cw.phone_number_id IS NOT NULL AND cw.token_encrypted IS NOT NULL AND COALESCE(m.missing_templates, 0::bigint) = 0 AS ready
   FROM organizations o
     LEFT JOIN channel_whatsapp cw ON cw.org_id = o.id
     LEFT JOIN missing m ON m.org_id = o.id;;

     CREATE OR REPLACE FUNCTION public.admin_stats_overview()
 RETURNS TABLE(orgs_count bigint, owners_count bigint, po_managers_count bigint, purchase_orders_count bigint, accepted_suggest_qty bigint, error_count bigint, accepted_suggestions bigint, total_suggestions bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_platform_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    (select count(distinct org_id) from public.org_members where role = 'owner')::bigint,
    (select count(*) from public.org_members where role = 'owner')::bigint,
    (select count(*) from public.org_members where role = 'po_manager')::bigint,
    (select count(*) from public.purchase_orders)::bigint,
    coalesce((select sum(coalesce(recommended_qty,0)) from public.suggestions where (status::text in ('ACCEPTED','PO_CREATED'))),0)::bigint,
    (select count(*) from public.audit_log where action ilike 'ERROR%' or coalesce(meta->>'level','') ilike 'error')::bigint,
    (select count(*) from public.suggestions where (status::text in ('ACCEPTED','PO_CREATED')))::bigint,
    (select count(*) from public.suggestions)::bigint;
end;
$function$


CREATE OR REPLACE FUNCTION public.in_org(p_org uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from public.org_members om
    where om.org_id = p_org
      and om.user_id = auth.uid()
      and coalesce(om.is_active, true)
  );
$function$


CREATE OR REPLACE FUNCTION public.has_org_role(p_org uuid, p_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from public.org_members om
    where om.org_id = p_org
      and om.user_id = auth.uid()
      and coalesce(om.is_active, true)
      and om.role = p_role
  );
$function$


CREATE OR REPLACE FUNCTION public.get_default_org_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select om.org_id
  from public.org_members om
  where om.user_id = auth.uid()
    and coalesce(om.is_active, true)
  order by (om.role = 'owner') desc, om.created_at asc
  limit 1;
$function$


CREATE OR REPLACE FUNCTION public.is_platform_owner()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (select 1 from public.platform_owners po where po.user_id = auth.uid());
$function$


CREATE OR REPLACE FUNCTION public.set_org_and_creator()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_org uuid;
begin
  if new.org_id is null then
    select om.org_id into v_org
    from org_members om
    where om.user_id = auth.uid()
    order by om.created_at
    limit 1;

    new.org_id := coalesce(new.org_id, v_org);
  end if;

  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.is_org_owner(p_org uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1 from public.org_members
    where org_id = p_org and user_id = auth.uid() and role = 'owner'
  );
$function$


CREATE OR REPLACE FUNCTION public.create_org_for_me(p_name text, p_dial text, p_lang text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_org uuid;
begin
  insert into public.organizations(name, default_dial_code, default_language)
  values (nullif(trim(p_name),''), coalesce(nullif(trim(p_dial),''), '+964'), coalesce(nullif(trim(p_lang),''), 'ar'))
  returning id into v_org;

  insert into public.org_members(org_id, user_id, role)
  values (v_org, auth.uid(), 'owner');

  return v_org;
end;
$function$


CREATE OR REPLACE FUNCTION public.current_org_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare oid uuid;
begin
  select om.org_id into oid
  from org_members om
  where om.user_id = auth.uid()
  order by om.created_at asc
  limit 1;
  return oid;
end $function$


CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$function$


CREATE OR REPLACE FUNCTION public.is_org_member(p_org uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (select 1 from public.members m where m.org_id=p_org and m.user_id=auth.uid());
$function$


CREATE OR REPLACE FUNCTION public.has_role(p_org uuid, p_role member_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (select 1 from public.members m where m.org_id=p_org and m.user_id=auth.uid() and m.role=p_role);
$function$


CREATE OR REPLACE FUNCTION public._status_bucket(s text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when s is null then 'unknown'
    when s in ('PENDING') then 'pending'
    when s in ('REJECTED','CANCELED','CANCELLED','IGNORED') then 'rejected'
    when s in ('APPROVED','ACCEPTED','PO_CREATED','CREATED_PO','DONE','COMPLETED','RESOLVED') then 'accepted'
    else 'other'
  end;
$function$


CREATE OR REPLACE FUNCTION public.admin_stats()
 RETURNS TABLE(total_orgs bigint, owners bigint, po_managers bigint, po_total bigint, po_open bigint, po_delivered_30d bigint, suggestions_total bigint, suggestions_accepted bigint, accepted_qty numeric, failed_sends_30d bigint, errors_30d bigint, active_orgs_30d bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (select 1 from platform_admins where user_id = auth.uid()) then
    raise exception 'forbidden';
  end if;

  return query select * from admin_v_stats;
end;
$function$


CREATE OR REPLACE FUNCTION public.touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end $function$


CREATE OR REPLACE FUNCTION public.po_items_block(p_po_id uuid, p_max_lines integer DEFAULT 8)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  total int;
  lines int;
  txt text;
begin
  select count(*) into total
  from purchase_order_items where po_id = p_po_id;

  with firstn as (
    select row_number() over (order by id) as rn,
           (select name from products where id = poi.product_id) as product_name,
           qty
    from purchase_order_items poi
    where poi.po_id = p_po_id
    order by poi.id
    limit p_max_lines
  )
  select string_agg('• ' || coalesce(product_name,'(unknown)') || ' — ' || qty::text, E'\n'),
         (select max(rn) from firstn)
  into txt, lines
  from firstn;

  if total > coalesce(lines,0) then
    txt := coalesce(txt,'') || E'\n+' || (total - lines) || ' more';
  end if;

  return coalesce(txt,'');
end $function$


CREATE OR REPLACE FUNCTION public.effective_language(p_org uuid, p_supplier uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select coalesce(
    (select preferred_language from suppliers where id = p_supplier and org_id = p_org),
    (select default_language from organizations where id = p_org),
    'ar'
  );
$function$


CREATE TRIGGER trg_touch_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_suppliers BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_supplier_contacts BEFORE UPDATE ON supplier_contacts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_stores BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_suggestions BEFORE UPDATE ON suggestions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_inquiries BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_purchase_orders BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_whatsapp_outbox BEFORE UPDATE ON whatsapp_outbox FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_channel_whatsapp BEFORE UPDATE ON channel_whatsapp FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER tg_suppliers_set_org BEFORE INSERT ON suppliers FOR EACH ROW EXECUTE FUNCTION set_org_and_creator();
CREATE TRIGGER tg_sales_set_org BEFORE INSERT ON sales_uploads FOR EACH ROW EXECUTE FUNCTION set_org_and_creator();
CREATE TRIGGER tg_stock_set_org BEFORE INSERT ON stock_uploads FOR EACH ROW EXECUTE FUNCTION set_org_and_creator();
CREATE TRIGGER tg_outbox_set_org BEFORE INSERT ON whatsapp_outbox FOR EACH ROW EXECUTE FUNCTION set_org_and_creator();

