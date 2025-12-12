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
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          description: string
          details: string | null
          id: string
          quantity: number
          sort_order: number
          total: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          description: string
          details?: string | null
          id?: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          description?: string
          details?: string | null
          id?: string
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          budget_number: string
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          discount: number
          id: string
          logo_url: string | null
          notes: string | null
          payment_conditions: string | null
          status: string
          subtotal: number
          tax: number
          terms_conditions: string | null
          total: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          budget_number: string
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          discount?: number
          id?: string
          logo_url?: string | null
          notes?: string | null
          payment_conditions?: string | null
          status?: string
          subtotal?: number
          tax?: number
          terms_conditions?: string | null
          total?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          budget_number?: string
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          discount?: number
          id?: string
          logo_url?: string | null
          notes?: string | null
          payment_conditions?: string | null
          status?: string
          subtotal?: number
          tax?: number
          terms_conditions?: string | null
          total?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rg: string | null
          shows_count: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rg?: string | null
          shows_count?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rg?: string | null
          shows_count?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          thumbnail: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          thumbnail?: string | null
          title: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          thumbnail?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contract_clauses: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          artist_address: string | null
          artist_document: string | null
          artist_email: string | null
          artist_name: string | null
          artist_phone: string | null
          clauses: Json
          client_address: string | null
          client_document: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          contract_number: string
          created_at: string
          discount: number
          event_date: string | null
          event_duration: string | null
          event_location: string | null
          event_time: string | null
          event_type: string | null
          id: string
          payment_terms: string | null
          show_id: string | null
          signed_at: string | null
          status: string
          title: string
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_address?: string | null
          artist_document?: string | null
          artist_email?: string | null
          artist_name?: string | null
          artist_phone?: string | null
          clauses?: Json
          client_address?: string | null
          client_document?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          contract_number: string
          created_at?: string
          discount?: number
          event_date?: string | null
          event_duration?: string | null
          event_location?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          payment_terms?: string | null
          show_id?: string | null
          signed_at?: string | null
          status?: string
          title: string
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_address?: string | null
          artist_document?: string | null
          artist_email?: string | null
          artist_name?: string | null
          artist_phone?: string | null
          clauses?: Json
          client_address?: string | null
          client_document?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          contract_number?: string
          created_at?: string
          discount?: number
          event_date?: string | null
          event_duration?: string | null
          event_location?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          payment_terms?: string | null
          show_id?: string | null
          signed_at?: string | null
          status?: string
          title?: string
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          month: number
          target_value: number
          title: string
          type: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          month: number
          target_value: number
          title: string
          type: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          month?: number
          target_value?: number
          title?: string
          type?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          changed_at: string
          created_at: string
          from_status: string | null
          id: string
          lead_id: string
          to_status: string
        }
        Insert: {
          changed_at?: string
          created_at?: string
          from_status?: string | null
          id?: string
          lead_id: string
          to_status: string
        }
        Update: {
          changed_at?: string
          created_at?: string
          from_status?: string | null
          id?: string
          lead_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          event_date: string | null
          event_type: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      musicians: {
        Row: {
          created_at: string
          email: string | null
          id: string
          instrument: string | null
          member_type: string | null
          name: string
          notes: string | null
          payment_request_date: string | null
          phone: string | null
          rate: number | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          instrument?: string | null
          member_type?: string | null
          name: string
          notes?: string | null
          payment_request_date?: string | null
          phone?: string | null
          rate?: number | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          instrument?: string | null
          member_type?: string | null
          name?: string
          notes?: string | null
          payment_request_date?: string | null
          phone?: string | null
          rate?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      show_checklist: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          item: string
          show_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          item: string
          show_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          item?: string
          show_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_checklist_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      show_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          show_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          show_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          show_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_expenses_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      show_musicians: {
        Row: {
          confirmed: boolean | null
          created_at: string
          fee: number
          id: string
          musician_id: string
          show_id: string
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          fee?: number
          id?: string
          musician_id: string
          show_id: string
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          fee?: number
          id?: string
          musician_id?: string
          show_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_musicians_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_musicians_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          address: string | null
          cachet: number
          client_id: string | null
          created_at: string
          date: string
          end_time: string | null
          event_type: string | null
          id: string
          lead_id: string | null
          notes: string | null
          start_time: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          cachet?: number
          client_id?: string | null
          created_at?: string
          date: string
          end_time?: string | null
          event_type?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          cachet?: number
          client_id?: string | null
          created_at?: string
          date?: string
          end_time?: string | null
          event_type?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shows_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          show_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          show_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          show_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
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
