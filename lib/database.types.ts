export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown | null
          not_after: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          meta: Json | null
          org_id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          meta?: Json | null
          org_id: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          meta?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      channel_whatsapp: {
        Row: {
          connect_method: string
          connected_display_name: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_error: string | null
          last_template_sync: string | null
          last_test_at: string | null
          org_id: string
          phone_number_id: string
          template_count: number
          token_encrypted: string | null
          token_hint: string | null
          token_masked: string | null
          updated_at: string | null
          waba_id: string
        }
        Insert: {
          connect_method?: string
          connected_display_name?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_error?: string | null
          last_template_sync?: string | null
          last_test_at?: string | null
          org_id: string
          phone_number_id: string
          template_count?: number
          token_encrypted?: string | null
          token_hint?: string | null
          token_masked?: string | null
          updated_at?: string | null
          waba_id: string
        }
        Update: {
          connect_method?: string
          connected_display_name?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_error?: string | null
          last_template_sync?: string | null
          last_test_at?: string | null
          org_id?: string
          phone_number_id?: string
          template_count?: number
          token_encrypted?: string | null
          token_hint?: string | null
          token_masked?: string | null
          updated_at?: string | null
          waba_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_whatsapp_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_whatsapp_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      inquiries: {
        Row: {
          answer_bool: boolean | null
          answer_date: string | null
          answer_date_relation: Database["public"]["Enums"]["rel_binary"] | null
          answer_discount: boolean | null
          answer_price_direction:
            | Database["public"]["Enums"]["price_direction"]
            | null
          answer_qty_relation:
            | Database["public"]["Enums"]["qty_relation"]
            | null
          answer_qty_threshold: number | null
          answered_at: string | null
          answered_by: string | null
          created_at: string | null
          created_by: string
          id: string
          note: string | null
          org_id: string
          status: Database["public"]["Enums"]["inquiry_status"] | null
          suggestion_id: string | null
          supplier_id: string
          template_id: string | null
          template_name: string
          to_phone: string
          type: Database["public"]["Enums"]["suggestion_subtype"]
          updated_at: string | null
          variables: Json
        }
        Insert: {
          answer_bool?: boolean | null
          answer_date?: string | null
          answer_date_relation?:
            | Database["public"]["Enums"]["rel_binary"]
            | null
          answer_discount?: boolean | null
          answer_price_direction?:
            | Database["public"]["Enums"]["price_direction"]
            | null
          answer_qty_relation?:
            | Database["public"]["Enums"]["qty_relation"]
            | null
          answer_qty_threshold?: number | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          note?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          suggestion_id?: string | null
          supplier_id: string
          template_id?: string | null
          template_name: string
          to_phone: string
          type: Database["public"]["Enums"]["suggestion_subtype"]
          updated_at?: string | null
          variables: Json
        }
        Update: {
          answer_bool?: boolean | null
          answer_date?: string | null
          answer_date_relation?:
            | Database["public"]["Enums"]["rel_binary"]
            | null
          answer_discount?: boolean | null
          answer_price_direction?:
            | Database["public"]["Enums"]["price_direction"]
            | null
          answer_qty_relation?:
            | Database["public"]["Enums"]["qty_relation"]
            | null
          answer_qty_threshold?: number | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          note?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          suggestion_id?: string | null
          supplier_id?: string
          template_id?: string | null
          template_name?: string
          to_phone?: string
          type?: Database["public"]["Enums"]["suggestion_subtype"]
          updated_at?: string | null
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "inquiries_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_snapshots: {
        Row: {
          expiry_date: string | null
          id: string
          org_id: string
          product_id: string
          qty: number
          recorded_at: string
          store_id: string
          supplier_id: string | null
          supplier_phone: string | null
          upload_id: string
        }
        Insert: {
          expiry_date?: string | null
          id?: string
          org_id: string
          product_id: string
          qty: number
          recorded_at?: string
          store_id: string
          supplier_id?: string | null
          supplier_phone?: string | null
          upload_id: string
        }
        Update: {
          expiry_date?: string | null
          id?: string
          org_id?: string
          product_id?: string
          qty?: number
          recorded_at?: string
          store_id?: string
          supplier_id?: string | null
          supplier_phone?: string | null
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "inventory_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "report_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          org_id: string
          phone_e164: string | null
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          org_id: string
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          org_id?: string
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          created_by: string | null
          facts_config: Json
          id: string
          key: string
          language_code: string
          meta_template_name: string
          needs_meta_approval: boolean | null
          org_id: string
          status: string
          updated_at: string | null
          updated_by: string | null
          variables: Json
          version: number
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          created_by?: string | null
          facts_config?: Json
          id?: string
          key: string
          language_code?: string
          meta_template_name: string
          needs_meta_approval?: boolean | null
          org_id: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json
          version?: number
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          facts_config?: Json
          id?: string
          key?: string
          language_code?: string
          meta_template_name?: string
          needs_meta_approval?: boolean | null
          org_id?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          created_at: string | null
          default_cadence: string | null
          default_language: string
          id: string
          name: string
          sla_target_days: number
          ssi_days: number
          timezone: string | null
          updated_at: string | null
          working_days: number[] | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          default_cadence?: string | null
          default_language?: string
          id?: string
          name: string
          sla_target_days?: number
          ssi_days?: number
          timezone?: string | null
          updated_at?: string | null
          working_days?: number[] | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          default_cadence?: string | null
          default_language?: string
          id?: string
          name?: string
          sla_target_days?: number
          ssi_days?: number
          timezone?: string | null
          updated_at?: string | null
          working_days?: number[] | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string
          created_at: string | null
          id: string
          lead_time_days: number | null
          moq: number | null
          name: string | null
          org_id: string
          pack_size: number | null
          updated_at: string | null
        }
        Insert: {
          barcode: string
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          moq?: number | null
          name?: string | null
          org_id: string
          pack_size?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          moq?: number | null
          name?: string | null
          org_id?: string
          pack_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          po_id: string
          product_id: string
          qty: number
          status: Database["public"]["Enums"]["po_item_status"] | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          po_id: string
          product_id: string
          qty: number
          status?: Database["public"]["Enums"]["po_item_status"] | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          po_id?: string
          product_id?: string
          qty?: number
          status?: Database["public"]["Enums"]["po_item_status"] | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          created_by: string
          delivered_at: string | null
          id: string
          note: string | null
          org_id: string
          po_number: string
          promised_date: string | null
          status: Database["public"]["Enums"]["po_status"]
          store_id: string
          supplier_id: string
          to_phone: string | null
          totals: number | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          created_by: string
          delivered_at?: string | null
          id?: string
          note?: string | null
          org_id: string
          po_number: string
          promised_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          store_id: string
          supplier_id: string
          to_phone?: string | null
          totals?: number | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          created_by?: string
          delivered_at?: string | null
          id?: string
          note?: string | null
          org_id?: string
          po_number?: string
          promised_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          store_id?: string
          supplier_id?: string
          to_phone?: string | null
          totals?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "purchase_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reorder_prefs: {
        Row: {
          cadence: string
          day_of_week: number[] | null
          id: string
          notes: string | null
          org_id: string
          product_id: string | null
          source: string
          supplier_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cadence: string
          day_of_week?: number[] | null
          id?: string
          notes?: string | null
          org_id: string
          product_id?: string | null
          source?: string
          supplier_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cadence?: string
          day_of_week?: number[] | null
          id?: string
          notes?: string | null
          org_id?: string
          product_id?: string | null
          source?: string
          supplier_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reorder_prefs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reorder_prefs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "reorder_prefs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reorder_prefs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      report_uploads: {
        Row: {
          filename: string | null
          id: string
          kind: Database["public"]["Enums"]["report_kind"]
          org_id: string
          store_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          filename?: string | null
          id?: string
          kind: Database["public"]["Enums"]["report_kind"]
          org_id: string
          store_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          filename?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["report_kind"]
          org_id?: string
          store_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_uploads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_uploads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "report_uploads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_rows: {
        Row: {
          id: string
          org_id: string
          product_id: string
          recorded_at: string
          sold_qty: number
          store_id: string
          upload_id: string
        }
        Insert: {
          id?: string
          org_id: string
          product_id: string
          recorded_at?: string
          sold_qty: number
          store_id: string
          upload_id: string
        }
        Update: {
          id?: string
          org_id?: string
          product_id?: string
          recorded_at?: string
          sold_qty?: number
          store_id?: string
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_rows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "sales_rows_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "report_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      suggestions: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["suggestion_kind"]
          org_id: string
          payload: Json | null
          product_id: string | null
          reason: string | null
          recommended_qty: number | null
          status: Database["public"]["Enums"]["suggestion_status"]
          store_id: string
          subtype: Database["public"]["Enums"]["suggestion_subtype"]
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          kind: Database["public"]["Enums"]["suggestion_kind"]
          org_id: string
          payload?: Json | null
          product_id?: string | null
          reason?: string | null
          recommended_qty?: number | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          store_id: string
          subtype: Database["public"]["Enums"]["suggestion_subtype"]
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["suggestion_kind"]
          org_id?: string
          payload?: Json | null
          product_id?: string | null
          reason?: string | null
          recommended_qty?: number | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          store_id?: string
          subtype?: Database["public"]["Enums"]["suggestion_subtype"]
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "suggestions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_contacts: {
        Row: {
          created_at: string | null
          id: string
          is_whatsapp: boolean | null
          opted_in: boolean | null
          org_id: string
          phone_e164: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_whatsapp?: boolean | null
          opted_in?: boolean | null
          org_id: string
          phone_e164: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_whatsapp?: boolean | null
          opted_in?: boolean | null
          org_id?: string
          phone_e164?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "supplier_contacts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          org_id: string
          preferred_language: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          preferred_language?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          preferred_language?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      whatsapp_outbox: {
        Row: {
          api_response: Json | null
          attempt_count: number
          channel_id: string | null
          created_at: string | null
          error_code: string | null
          error_details: string | null
          error_title: string | null
          id: string
          last_attempt_at: string | null
          next_attempt_at: string | null
          org_id: string
          payload: Json
          provider_message_id: string | null
          provider_status: string | null
          ref_inquiry_id: string | null
          ref_po_id: string | null
          rendered_text: string | null
          status: Database["public"]["Enums"]["outbox_status"] | null
          template_id: string | null
          template_name: string
          to_phone: string
          updated_at: string | null
        }
        Insert: {
          api_response?: Json | null
          attempt_count?: number
          channel_id?: string | null
          created_at?: string | null
          error_code?: string | null
          error_details?: string | null
          error_title?: string | null
          id?: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          org_id: string
          payload: Json
          provider_message_id?: string | null
          provider_status?: string | null
          ref_inquiry_id?: string | null
          ref_po_id?: string | null
          rendered_text?: string | null
          status?: Database["public"]["Enums"]["outbox_status"] | null
          template_id?: string | null
          template_name: string
          to_phone: string
          updated_at?: string | null
        }
        Update: {
          api_response?: Json | null
          attempt_count?: number
          channel_id?: string | null
          created_at?: string | null
          error_code?: string | null
          error_details?: string | null
          error_title?: string | null
          id?: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          org_id?: string
          payload?: Json
          provider_message_id?: string | null
          provider_status?: string | null
          ref_inquiry_id?: string | null
          ref_po_id?: string | null
          rendered_text?: string | null
          status?: Database["public"]["Enums"]["outbox_status"] | null
          template_id?: string | null
          template_name?: string
          to_phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_outbox_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_ref_inquiry_id_fkey"
            columns: ["ref_inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_ref_po_id_fkey"
            columns: ["ref_po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_remote_templates: {
        Row: {
          body: string | null
          category: string | null
          id: string
          language_code: string
          last_synced_at: string | null
          org_id: string
          quality: string | null
          status: string | null
          variables: Json | null
          waba_template_name: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          id?: string
          language_code: string
          last_synced_at?: string | null
          org_id: string
          quality?: string | null
          status?: string | null
          variables?: Json | null
          waba_template_name: string
        }
        Update: {
          body?: string | null
          category?: string | null
          id?: string
          language_code?: string
          last_synced_at?: string | null
          org_id?: string
          quality?: string | null
          status?: string | null
          variables?: Json | null
          waba_template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_remote_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_remote_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Views: {
      mv_weekly_sales: {
        Row: {
          org_id: string | null
          product_id: string | null
          store_id: string | null
          weekly_sales_equiv: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_rows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "sales_rows_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      v_org_whatsapp_readiness: {
        Row: {
          has_phone_id: boolean | null
          has_token: boolean | null
          is_connected: boolean | null
          missing_templates: number | null
          org_id: string | null
          org_name: string | null
          ready: boolean | null
        }
        Relationships: []
      }
      v_template_match: {
        Row: {
          exists_remote: boolean | null
          key: string | null
          language_code: string | null
          local_status: string | null
          meta_template_name: string | null
          org_id: string | null
          remote_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_whatsapp_queue: {
        Row: {
          channel_id: string | null
          created_at: string | null
          id: string | null
          next_attempt_at: string | null
          org_id: string | null
          phone_number_id: string | null
          status: Database["public"]["Enums"]["outbox_status"] | null
          template_id: string | null
          to_phone: string | null
          waba_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_outbox_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_whatsapp_readiness"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "whatsapp_outbox_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      effective_language: {
        Args: { p_org: string; p_supplier: string }
        Returns: string
      }
      has_role: {
        Args: {
          p_org: string
          p_role: Database["public"]["Enums"]["member_role"]
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org: string }
        Returns: boolean
      }
      po_items_block: {
        Args: { p_max_lines?: number; p_po_id: string }
        Returns: string
      }
    }
    Enums: {
      inquiry_status: "DRAFT" | "SENT" | "ANSWER_RECORDED" | "CLOSED"
      member_role: "OWNER" | "PO_MANAGER"
      outbox_status: "QUEUED" | "SENT" | "FAILED"
      po_item_status: "OPEN" | "BACKORDERED" | "CANCELED" | "EXCHANGED"
      po_status:
        | "Draft"
        | "Dispatched"
        | "Failed"
        | "Delivered"
        | "Cancelled"
        | "DRAFT"
        | "DISPATCHED"
        | "ACKNOWLEDGED"
        | "CHANGE_PROPOSED"
        | "REJECTED"
        | "IN_TRANSIT"
        | "PARTIAL"
        | "DELIVERED"
        | "CLOSED"
      price_direction: "UP" | "DOWN"
      qty_relation: "LOWER_THAN" | "HIGHER_THAN"
      rel_binary: "AFTER" | "BEFORE"
      reorder_mode: "min_max" | "doc"
      report_kind: "SALES" | "STOCK"
      suggestion_kind: "INQUIRY" | "STOCK_OP"
      suggestion_status:
        | "New"
        | "WaitingRFQ"
        | "Accepted"
        | "Declined"
        | "Snoozed"
        | "Muted"
        | "Resolved"
        | "PENDING"
        | "ACCEPTED"
        | "EDITED"
        | "DISMISSED"
        | "SENT"
      suggestion_subtype:
        | "INQ_STOCK"
        | "INQ_EXPIRY_LATEST"
        | "INQ_BULK_PRICE"
        | "REQ_PROMOTER"
        | "REQ_EXCHANGE"
        | "INQ_SLA"
        | "REMINDER"
        | "REFILL_WEEKS"
        | "FAST_TOPUP"
        | "OVERSTOCK"
        | "PROMO_BUMP"
        | "EXPIRY_GUARD"
        | "BULK_PRICE_BREAK"
        | "SLA_AWARE"
        | "TRANSIT_INFO"
        | "ANOMALY"
      suggestion_type:
        | "RFQ"
        | "Return"
        | "Exchange"
        | "Promoter"
        | "Markdown"
        | "PriceUp"
        | "PriceDown"
        | "LeadTime"
        | "Consolidation"
        | "Freeze"
        | "DataGap"
        | "Outflow"
        | "Split"
        | "Escalation"
      upload_kind: "stock" | "sales"
      user_role: "owner" | "admin" | "po_manager" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  public: {
    Enums: {
      inquiry_status: ["DRAFT", "SENT", "ANSWER_RECORDED", "CLOSED"],
      member_role: ["OWNER", "PO_MANAGER"],
      outbox_status: ["QUEUED", "SENT", "FAILED"],
      po_item_status: ["OPEN", "BACKORDERED", "CANCELED", "EXCHANGED"],
      po_status: [
        "Draft",
        "Dispatched",
        "Failed",
        "Delivered",
        "Cancelled",
        "DRAFT",
        "DISPATCHED",
        "ACKNOWLEDGED",
        "CHANGE_PROPOSED",
        "REJECTED",
        "IN_TRANSIT",
        "PARTIAL",
        "DELIVERED",
        "CLOSED",
      ],
      price_direction: ["UP", "DOWN"],
      qty_relation: ["LOWER_THAN", "HIGHER_THAN"],
      rel_binary: ["AFTER", "BEFORE"],
      reorder_mode: ["min_max", "doc"],
      report_kind: ["SALES", "STOCK"],
      suggestion_kind: ["INQUIRY", "STOCK_OP"],
      suggestion_status: [
        "New",
        "WaitingRFQ",
        "Accepted",
        "Declined",
        "Snoozed",
        "Muted",
        "Resolved",
        "PENDING",
        "ACCEPTED",
        "EDITED",
        "DISMISSED",
        "SENT",
      ],
      suggestion_subtype: [
        "INQ_STOCK",
        "INQ_EXPIRY_LATEST",
        "INQ_BULK_PRICE",
        "REQ_PROMOTER",
        "REQ_EXCHANGE",
        "INQ_SLA",
        "REMINDER",
        "REFILL_WEEKS",
        "FAST_TOPUP",
        "OVERSTOCK",
        "PROMO_BUMP",
        "EXPIRY_GUARD",
        "BULK_PRICE_BREAK",
        "SLA_AWARE",
        "TRANSIT_INFO",
        "ANOMALY",
      ],
      suggestion_type: [
        "RFQ",
        "Return",
        "Exchange",
        "Promoter",
        "Markdown",
        "PriceUp",
        "PriceDown",
        "LeadTime",
        "Consolidation",
        "Freeze",
        "DataGap",
        "Outflow",
        "Split",
        "Escalation",
      ],
      upload_kind: ["stock", "sales"],
      user_role: ["owner", "admin", "po_manager", "viewer"],
    },
  },
  storage: {
    Enums: {},
  },
} as const
