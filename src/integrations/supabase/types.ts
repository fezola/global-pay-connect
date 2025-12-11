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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_last4: string
          last_used_at: string | null
          merchant_id: string
          name: string | null
          permissions: string[] | null
          type: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_last4: string
          last_used_at?: string | null
          merchant_id: string
          name?: string | null
          permissions?: string[] | null
          type: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_last4?: string
          last_used_at?: string | null
          merchant_id?: string
          name?: string | null
          permissions?: string[] | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          merchant_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          merchant_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          merchant_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_documents: {
        Row: {
          business_id: string
          doc_type: Database["public"]["Enums"]["document_type"]
          filename: string
          id: string
          mime_type: string | null
          s3_key: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          business_id: string
          doc_type: Database["public"]["Enums"]["document_type"]
          filename: string
          id?: string
          mime_type?: string | null
          s3_key?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          business_id?: string
          doc_type?: Database["public"]["Enums"]["document_type"]
          filename?: string
          id?: string
          mime_type?: string | null
          s3_key?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_documents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_owners: {
        Row: {
          business_id: string
          created_at: string | null
          dob: string | null
          doc_url: string | null
          email: string | null
          id: string
          id_number: string | null
          id_type: string | null
          name: string
          nationality: string | null
          ownership_percentage: number | null
          role: string | null
          selfie_url: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          dob?: string | null
          doc_url?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          name: string
          nationality?: string | null
          ownership_percentage?: number | null
          role?: string | null
          selfie_url?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          dob?: string | null
          doc_url?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          name?: string
          nationality?: string | null
          ownership_percentage?: number | null
          role?: string | null
          selfie_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_owners_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_wallets: {
        Row: {
          address: string
          business_id: string
          chain: string
          created_at: string | null
          details: Json | null
          id: string
          proof_nonce: string | null
          proof_signature: string | null
          proof_verified: boolean | null
          type: Database["public"]["Enums"]["wallet_type"]
          verified_at: string | null
        }
        Insert: {
          address: string
          business_id: string
          chain: string
          created_at?: string | null
          details?: Json | null
          id?: string
          proof_nonce?: string | null
          proof_signature?: string | null
          proof_verified?: boolean | null
          type: Database["public"]["Enums"]["wallet_type"]
          verified_at?: string | null
        }
        Update: {
          address?: string
          business_id?: string
          chain?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          proof_nonce?: string | null
          proof_signature?: string | null
          proof_verified?: boolean | null
          type?: Database["public"]["Enums"]["wallet_type"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_wallets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: Json | null
          country: string
          created_at: string | null
          entity_type: string
          id: string
          legal_name: string
          merchant_id: string
          production_restrictions: Json | null
          registration_number: string | null
          status: Database["public"]["Enums"]["business_status"] | null
          submitted_at: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string | null
          verified_at: string | null
          wallet_verified: boolean | null
        }
        Insert: {
          address?: Json | null
          country: string
          created_at?: string | null
          entity_type: string
          id?: string
          legal_name: string
          merchant_id: string
          production_restrictions?: Json | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["business_status"] | null
          submitted_at?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          verified_at?: string | null
          wallet_verified?: boolean | null
        }
        Update: {
          address?: Json | null
          country?: string
          created_at?: string | null
          entity_type?: string
          id?: string
          legal_name?: string
          merchant_id?: string
          production_restrictions?: Json | null
          registration_number?: string | null
          status?: Database["public"]["Enums"]["business_status"] | null
          submitted_at?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
          verified_at?: string | null
          wallet_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          email: string
          id: string
          merchant_id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          email: string
          id?: string
          merchant_id: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          merchant_id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          credentials: Json | null
          id: string
          is_connected: boolean | null
          is_production: boolean | null
          last_test_at: string | null
          last_test_result: string | null
          merchant_id: string
          name: string | null
          provider: string
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_connected?: boolean | null
          is_production?: boolean | null
          last_test_at?: string | null
          last_test_result?: string | null
          merchant_id: string
          name?: string | null
          provider: string
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_connected?: boolean | null
          is_production?: boolean | null
          last_test_at?: string | null
          last_test_result?: string | null
          merchant_id?: string
          name?: string | null
          provider?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      kyb_jobs: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          result_payload: Json | null
          status: Database["public"]["Enums"]["kyb_status"] | null
          updated_at: string | null
          vendor: string | null
          vendor_payload: Json | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          result_payload?: Json | null
          status?: Database["public"]["Enums"]["kyb_status"] | null
          updated_at?: string | null
          vendor?: string | null
          vendor_payload?: Json | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          result_payload?: Json | null
          status?: Database["public"]["Enums"]["kyb_status"] | null
          updated_at?: string | null
          vendor?: string | null
          vendor_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kyb_jobs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          api_key_live: string | null
          api_key_sandbox: string | null
          business_id: string | null
          business_type: string | null
          country: string
          created_at: string | null
          email: string
          id: string
          kyb_status: Database["public"]["Enums"]["kyb_status"] | null
          name: string
          production_enabled: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
          website: string | null
        }
        Insert: {
          api_key_live?: string | null
          api_key_sandbox?: string | null
          business_id?: string | null
          business_type?: string | null
          country?: string
          created_at?: string | null
          email: string
          id?: string
          kyb_status?: Database["public"]["Enums"]["kyb_status"] | null
          name: string
          production_enabled?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
        }
        Update: {
          api_key_live?: string | null
          api_key_sandbox?: string | null
          business_id?: string | null
          business_type?: string | null
          country?: string
          created_at?: string | null
          email?: string
          id?: string
          kyb_status?: Database["public"]["Enums"]["kyb_status"] | null
          name?: string
          production_enabled?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          is_active: boolean | null
          merchant_id: string
          name: string
          price: number
          seat_limit: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          merchant_id: string
          name: string
          price: number
          seat_limit?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          merchant_id?: string
          name?: string
          price?: number
          seat_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          merchant_id: string
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          merchant_id: string
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          merchant_id?: string
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          merchant_id: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: Database["public"]["Enums"]["team_member_status"] | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          merchant_id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          merchant_id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[] | null
          id: string
          is_enabled: boolean | null
          last_status_code: number | null
          last_triggered_at: string | null
          merchant_id: string
          secret: string
          url: string
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_enabled?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          merchant_id: string
          secret: string
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_enabled?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          merchant_id?: string
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_merchant_access: {
        Args: { _merchant_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "finance" | "developer" | "viewer"
      business_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "verified"
        | "rejected"
      document_status: "uploaded" | "verified" | "rejected"
      document_type:
        | "incorporation"
        | "articles"
        | "proof_of_address"
        | "tax_doc"
        | "id_document"
        | "selfie"
      kyb_status: "pending" | "queued" | "in_progress" | "verified" | "rejected"
      subscription_status: "active" | "cancelled" | "past_due" | "trialing"
      team_member_status: "invited" | "active" | "disabled"
      wallet_type: "hot" | "multisig" | "custodial"
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
  public: {
    Enums: {
      app_role: ["admin", "finance", "developer", "viewer"],
      business_status: [
        "draft",
        "submitted",
        "under_review",
        "verified",
        "rejected",
      ],
      document_status: ["uploaded", "verified", "rejected"],
      document_type: [
        "incorporation",
        "articles",
        "proof_of_address",
        "tax_doc",
        "id_document",
        "selfie",
      ],
      kyb_status: ["pending", "queued", "in_progress", "verified", "rejected"],
      subscription_status: ["active", "cancelled", "past_due", "trialing"],
      team_member_status: ["invited", "active", "disabled"],
      wallet_type: ["hot", "multisig", "custodial"],
    },
  },
} as const
