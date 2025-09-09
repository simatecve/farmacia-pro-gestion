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
      accounts_receivable: {
        Row: {
          amount: number
          amount_paid: number
          balance: number
          client_id: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          sale_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_paid?: number
          balance: number
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          balance?: number
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cash_register_sessions: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          id: string
          notes: string | null
          opened_at: string
          opening_amount: number
          register_name: string
          status: string
          total_card: number
          total_cash: number
          total_other: number
          total_sales: number
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_amount?: number
          register_name?: string
          status?: string
          total_card?: number
          total_cash?: number
          total_other?: number
          total_sales?: number
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_amount?: number
          register_name?: string
          status?: string
          total_card?: number
          total_cash?: number
          total_other?: number
          total_sales?: number
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_campaigns: {
        Row: {
          active: boolean
          campaign_type: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          message_template: string | null
          name: string
          start_date: string | null
          target_criteria: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          campaign_type: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          message_template?: string | null
          name: string
          start_date?: string | null
          target_criteria?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          campaign_type?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          message_template?: string | null
          name?: string
          start_date?: string | null
          target_criteria?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      client_reminders: {
        Row: {
          client_id: string
          created_at: string
          id: string
          message: string | null
          reminder_date: string
          reminder_type: string
          sent: boolean
          sent_at: string | null
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          message?: string | null
          reminder_date: string
          reminder_type: string
          sent?: boolean
          sent_at?: string | null
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reminder_date?: string
          reminder_type?: string
          sent?: boolean
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          identification_number: string | null
          last_purchase_date: string | null
          loyalty_points: number
          name: string
          notes: string | null
          phone: string | null
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          identification_number?: string | null
          last_purchase_date?: string | null
          loyalty_points?: number
          name: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          identification_number?: string | null
          last_purchase_date?: string | null
          loyalty_points?: number
          name?: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_stock: number | null
          batch_number: string | null
          created_at: string
          current_stock: number
          expiry_date: string | null
          id: string
          location_id: string
          product_id: string
          reserved_stock: number
          updated_at: string
        }
        Insert: {
          available_stock?: number | null
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          location_id: string
          product_id: string
          reserved_stock?: number
          updated_at?: string
        }
        Update: {
          available_stock?: number | null
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          location_id?: string
          product_id?: string
          reserved_stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          location_id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          stock_after: number
          stock_before: number
          total_cost: number | null
          unit_cost: number | null
          user_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          location_id: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          total_cost?: number | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          location_id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          total_cost?: number | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_plans: {
        Row: {
          active: boolean
          birthday_points: number
          created_at: string
          currency_per_point: number
          description: string | null
          id: string
          min_purchase_for_points: number
          name: string
          points_expiry_days: number | null
          points_per_currency: number
          referral_points: number
          tier_requirements: Json | null
          updated_at: string
          welcome_points: number
        }
        Insert: {
          active?: boolean
          birthday_points?: number
          created_at?: string
          currency_per_point?: number
          description?: string | null
          id?: string
          min_purchase_for_points?: number
          name: string
          points_expiry_days?: number | null
          points_per_currency?: number
          referral_points?: number
          tier_requirements?: Json | null
          updated_at?: string
          welcome_points?: number
        }
        Update: {
          active?: boolean
          birthday_points?: number
          created_at?: string
          currency_per_point?: number
          description?: string | null
          id?: string
          min_purchase_for_points?: number
          name?: string
          points_expiry_days?: number | null
          points_per_currency?: number
          referral_points?: number
          tier_requirements?: Json | null
          updated_at?: string
          welcome_points?: number
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          reference_number: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          reference_number?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          reference_number?: string | null
          sale_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          barcode: string | null
          category_id: string | null
          code: string | null
          concentration: string | null
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          laboratory: string | null
          max_stock: number
          min_stock: number
          name: string
          presentation: string | null
          purchase_price: number
          requires_prescription: boolean
          sale_price: number
          sku: string | null
          unit_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          category_id?: string | null
          code?: string | null
          concentration?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          laboratory?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          presentation?: string | null
          purchase_price?: number
          requires_prescription?: boolean
          sale_price?: number
          sku?: string | null
          unit_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          barcode?: string | null
          category_id?: string | null
          code?: string | null
          concentration?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          laboratory?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          presentation?: string | null
          purchase_price?: number
          requires_prescription?: boolean
          sale_price?: number
          sku?: string | null
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          applicable_categories: Json | null
          applicable_products: Json | null
          created_at: string
          description: string | null
          discount_value: number
          end_date: string
          id: string
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string
          promotion_type: string
          start_date: string
          updated_at: string
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          applicable_categories?: Json | null
          applicable_products?: Json | null
          created_at?: string
          description?: string | null
          discount_value?: number
          end_date: string
          id?: string
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name: string
          promotion_type: string
          start_date: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          applicable_categories?: Json | null
          applicable_products?: Json | null
          created_at?: string
          description?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name?: string
          promotion_type?: string
          start_date?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          approved_by: string | null
          client_id: string | null
          created_at: string
          id: string
          items_refunded: Json
          processed_at: string | null
          refund_amount: number
          refund_method: string
          refund_reason: string
          sale_id: string
          status: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          items_refunded: Json
          processed_at?: string | null
          refund_amount: number
          refund_method: string
          refund_reason: string
          sale_id: string
          status?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          items_refunded?: Json
          processed_at?: string | null
          refund_amount?: number
          refund_method?: string
          refund_reason?: string
          sale_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_id: string | null
          created_at: string
          discount_amount: number
          id: string
          notes: string | null
          payment_method: string | null
          sale_number: string
          status: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_number: string
          status?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_number?: string
          status?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
