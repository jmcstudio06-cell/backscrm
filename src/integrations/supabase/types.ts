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
      advances: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          due_type: string
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_type?: string
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_type?: string
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      annual_goals: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          category?: string
          completed?: boolean | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          target_value?: number
          title: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      artist_analyses: {
        Row: {
          artist_name: string
          availability: string
          created_at: string
          difficulties: string[]
          history_reflection: string | null
          id: string
          lost_opportunities: string
          shows_per_month: string
          status: string
          updated_at: string
          whatsapp: string
          who_manages: string
        }
        Insert: {
          artist_name: string
          availability: string
          created_at?: string
          difficulties: string[]
          history_reflection?: string | null
          id?: string
          lost_opportunities: string
          shows_per_month: string
          status?: string
          updated_at?: string
          whatsapp: string
          who_manages: string
        }
        Update: {
          artist_name?: string
          availability?: string
          created_at?: string
          difficulties?: string[]
          history_reflection?: string | null
          id?: string
          lost_opportunities?: string
          shows_per_month?: string
          status?: string
          updated_at?: string
          whatsapp?: string
          who_manages?: string
        }
        Relationships: []
      }
      artist_badges: {
        Row: {
          badge_type: string
          created_at: string
          id: string
          month: number
          show_count: number
          user_id: string
          year: number
        }
        Insert: {
          badge_type?: string
          created_at?: string
          id?: string
          month: number
          show_count?: number
          user_id: string
          year: number
        }
        Update: {
          badge_type?: string
          created_at?: string
          id?: string
          month?: number
          show_count?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      artist_equipment: {
        Row: {
          category: string
          created_at: string
          depreciation_method: string
          id: string
          is_active: boolean
          lifespan_months: number | null
          lifespan_shows: number | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          depreciation_method?: string
          id?: string
          is_active?: boolean
          lifespan_months?: number | null
          lifespan_shows?: number | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          depreciation_method?: string
          id?: string
          is_active?: boolean
          lifespan_months?: number | null
          lifespan_shows?: number | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_public_profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          base_city: string | null
          bio: string | null
          booking_discount_percent: number
          booking_max_dates: number
          booking_method: string | null
          booking_min_dates_discount: number
          booking_show_products: boolean
          created_at: string
          instagram_url: string | null
          media_kit_url: string | null
          music_style: string | null
          project_type: string | null
          repertoire_url: string | null
          show_video_url: string | null
          slug: string
          spotify_url: string | null
          tiktok_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          base_city?: string | null
          bio?: string | null
          booking_discount_percent?: number
          booking_max_dates?: number
          booking_method?: string | null
          booking_min_dates_discount?: number
          booking_show_products?: boolean
          created_at?: string
          instagram_url?: string | null
          media_kit_url?: string | null
          music_style?: string | null
          project_type?: string | null
          repertoire_url?: string | null
          show_video_url?: string | null
          slug: string
          spotify_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          base_city?: string | null
          bio?: string | null
          booking_discount_percent?: number
          booking_max_dates?: number
          booking_method?: string | null
          booking_min_dates_discount?: number
          booking_show_products?: boolean
          created_at?: string
          instagram_url?: string | null
          media_kit_url?: string | null
          music_style?: string | null
          project_type?: string | null
          repertoire_url?: string | null
          show_video_url?: string | null
          slug?: string
          spotify_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      bonuses: {
        Row: {
          completion_rule: string
          content_type: string
          content_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          reward_description: string | null
          reward_title: string | null
          reward_url: string | null
          sort_order: number
          thumbnail: string | null
          title: string
          unlock_after_hours: number
          updated_at: string
        }
        Insert: {
          completion_rule?: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_description?: string | null
          reward_title?: string | null
          reward_url?: string | null
          sort_order?: number
          thumbnail?: string | null
          title: string
          unlock_after_hours?: number
          updated_at?: string
        }
        Update: {
          completion_rule?: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_description?: string | null
          reward_title?: string | null
          reward_url?: string | null
          sort_order?: number
          thumbnail?: string | null
          title?: string
          unlock_after_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          artist_id: string
          client_name: string
          client_phone: string
          created_at: string
          event_city: string | null
          event_date: string
          event_location: string | null
          event_time: string | null
          event_type: string | null
          id: string
          observations: string | null
          product_id: string | null
          product_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          client_name: string
          client_phone: string
          created_at?: string
          event_city?: string | null
          event_date: string
          event_location?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          observations?: string | null
          product_id?: string | null
          product_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          event_city?: string | null
          event_date?: string
          event_location?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          observations?: string | null
          product_id?: string | null
          product_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "performance_types"
            referencedColumns: ["id"]
          },
        ]
      }
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
      checklist_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          tasks: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tasks?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tasks?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      content_plan_entries: {
        Row: {
          created_at: string
          day: number
          id: string
          month: number
          status: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          day: number
          id?: string
          month: number
          status?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          day?: number
          id?: string
          month?: number
          status?: string
          updated_at?: string
          user_id?: string
          year?: number
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
      guide_leads: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      improvements: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      landing_page_visits: {
        Row: {
          converted: boolean | null
          converted_at: string | null
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
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
          pix_key: string | null
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
          pix_key?: string | null
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
          pix_key?: string | null
          rate?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          notification_type: string
          sent_at: string
          sent_by: string | null
          target_audience: string
          title: string
          users_reached: number
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          notification_type?: string
          sent_at?: string
          sent_by?: string | null
          target_audience?: string
          title: string
          users_reached?: number
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          sent_at?: string
          sent_by?: string | null
          target_audience?: string
          title?: string
          users_reached?: number
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_enabled: boolean
          notification_text: string | null
          setting_key: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          notification_text?: string | null
          setting_key: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          notification_text?: string | null
          setting_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_payments: {
        Row: {
          activated_at: string | null
          amount_cents: number
          created_at: string
          gateway_event_id: string | null
          gateway_status: string | null
          id: string
          payer_email: string | null
          plan_key: string
          provider: string
          provider_payload: Json | null
          status: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          amount_cents: number
          created_at?: string
          gateway_event_id?: string | null
          gateway_status?: string | null
          id?: string
          payer_email?: string | null
          plan_key: string
          provider?: string
          provider_payload?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          amount_cents?: number
          created_at?: string
          gateway_event_id?: string | null
          gateway_status?: string | null
          id?: string
          payer_email?: string | null
          plan_key?: string
          provider?: string
          provider_payload?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_types: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          musician_ids: Json | null
          name: string
          price: number
          updated_at: string
          user_id: string
          visible_online: boolean
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          musician_ids?: Json | null
          name: string
          price?: number
          updated_at?: string
          user_id: string
          visible_online?: boolean
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          musician_ids?: Json | null
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
          visible_online?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_payment: string | null
          action_radius: number | null
          artist_name: string | null
          avatar_url: string | null
          base_city: string | null
          bio: string | null
          booking_discount_percent: number
          booking_max_dates: number
          booking_method: string
          booking_min_dates_discount: number
          booking_show_products: boolean
          cancel_at_period_end: boolean | null
          city: string | null
          created_at: string
          current_period_end: string | null
          delay_tolerance: string | null
          deposit_percentage: number | null
          email: string | null
          feature_blocks: Json | null
          has_interval: boolean | null
          id: string
          instagram_url: string | null
          last_seen: string | null
          late_fee_percentage: number | null
          media_kit_url: string | null
          min_fee: number | null
          music_style: string | null
          name: string | null
          onboarding_completed: boolean | null
          payment_deadline: string | null
          phone: string | null
          plan: string | null
          project_type: string | null
          repertoire_url: string | null
          requires_food: boolean | null
          show_duration: string | null
          show_video_url: string | null
          slug: string | null
          spotify_url: string | null
          start_time_limit: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tiktok_url: string | null
          trial_days: number | null
          trial_start: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          accepted_payment?: string | null
          action_radius?: number | null
          artist_name?: string | null
          avatar_url?: string | null
          base_city?: string | null
          bio?: string | null
          booking_discount_percent?: number
          booking_max_dates?: number
          booking_method?: string
          booking_min_dates_discount?: number
          booking_show_products?: boolean
          cancel_at_period_end?: boolean | null
          city?: string | null
          created_at?: string
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          has_interval?: boolean | null
          id?: string
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          repertoire_url?: string | null
          requires_food?: boolean | null
          show_duration?: string | null
          show_video_url?: string | null
          slug?: string | null
          spotify_url?: string | null
          start_time_limit?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_days?: number | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          accepted_payment?: string | null
          action_radius?: number | null
          artist_name?: string | null
          avatar_url?: string | null
          base_city?: string | null
          bio?: string | null
          booking_discount_percent?: number
          booking_max_dates?: number
          booking_method?: string
          booking_min_dates_discount?: number
          booking_show_products?: boolean
          cancel_at_period_end?: boolean | null
          city?: string | null
          created_at?: string
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          has_interval?: boolean | null
          id?: string
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          repertoire_url?: string | null
          requires_food?: boolean | null
          show_duration?: string | null
          show_video_url?: string | null
          slug?: string | null
          spotify_url?: string | null
          start_time_limit?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_days?: number | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      referral_config: {
        Row: {
          campaign_active: boolean
          created_at: string
          id: string
          min_active_days: number
          reward_10: number
          reward_20: number
          reward_30: number
          updated_at: string
        }
        Insert: {
          campaign_active?: boolean
          created_at?: string
          id?: string
          min_active_days?: number
          reward_10?: number
          reward_20?: number
          reward_30?: number
          updated_at?: string
        }
        Update: {
          campaign_active?: boolean
          created_at?: string
          id?: string
          min_active_days?: number
          reward_10?: number
          reward_20?: number
          reward_30?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          claimed_at: string
          days_awarded: number
          id: string
          milestone: number
          user_id: string
        }
        Insert: {
          claimed_at?: string
          days_awarded: number
          id?: string
          milestone: number
          user_id: string
        }
        Update: {
          claimed_at?: string
          days_awarded?: number
          id?: string
          milestone?: number
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invalidated_reason: string | null
          referred_name: string
          referred_phone: string
          referred_user_id: string | null
          referrer_id: string
          status: string
          updated_at: string
          validated_at: string | null
          whatsapp_sent: boolean
          whatsapp_sent_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invalidated_reason?: string | null
          referred_name: string
          referred_phone: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          whatsapp_sent?: boolean
          whatsapp_sent_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invalidated_reason?: string | null
          referred_name?: string
          referred_phone?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          whatsapp_sent?: boolean
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      repertoire_blocks: {
        Row: {
          climate: string
          created_at: string
          duration: string
          id: string
          name: string
          objective: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          climate?: string
          created_at?: string
          duration?: string
          id?: string
          name: string
          objective?: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          climate?: string
          created_at?: string
          duration?: string
          id?: string
          name?: string
          objective?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repertoire_songs: {
        Row: {
          artist: string | null
          block_id: string
          checked: boolean
          chords_reviewed: boolean
          created_at: string
          duration: string | null
          id: string
          is_main: boolean
          key_ok: boolean
          song_key: string | null
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist?: string | null
          block_id: string
          checked?: boolean
          chords_reviewed?: boolean
          created_at?: string
          duration?: string | null
          id?: string
          is_main?: boolean
          key_ok?: boolean
          song_key?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist?: string | null
          block_id?: string
          checked?: boolean
          chords_reviewed?: boolean
          created_at?: string
          duration?: string | null
          id?: string
          is_main?: boolean
          key_ok?: boolean
          song_key?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repertoire_songs_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "repertoire_blocks"
            referencedColumns: ["id"]
          },
        ]
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
          advance_amount: number
          cachet: number
          checklist_template_id: string | null
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
          advance_amount?: number
          cachet?: number
          checklist_template_id?: string | null
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
          advance_amount?: number
          cachet?: number
          checklist_template_id?: string | null
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
            foreignKeyName: "shows_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
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
      stage_mappings: {
        Row: {
          artist_name: string | null
          created_at: string
          event_date: string | null
          event_location: string | null
          event_name: string | null
          id: string
          input_list: Json | null
          materials_checklist: Json | null
          name: string
          observations: string | null
          show_id: string | null
          stage_layout: Json | null
          technical_contact: string | null
          technical_phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          event_name?: string | null
          id?: string
          input_list?: Json | null
          materials_checklist?: Json | null
          name?: string
          observations?: string | null
          show_id?: string | null
          stage_layout?: Json | null
          technical_contact?: string | null
          technical_phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string | null
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          event_name?: string | null
          id?: string
          input_list?: Json | null
          materials_checklist?: Json | null
          name?: string
          observations?: string | null
          show_id?: string | null
          stage_layout?: Json | null
          technical_contact?: string | null
          technical_phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_mappings_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_advance_payment: boolean
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
          is_advance_payment?: boolean
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
          is_advance_payment?: boolean
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
      tutorials: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          thumbnail: string | null
          title: string
          type: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          thumbnail?: string | null
          title: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          thumbnail?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_bonus_progress: {
        Row: {
          bonus_id: string
          completed_at: string | null
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          bonus_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          bonus_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bonus_progress_bonus_id_fkey"
            columns: ["bonus_id"]
            isOneToOne: false
            referencedRelation: "bonuses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_blocks: {
        Row: {
          blocked: boolean
          created_at: string
          feature_key: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          feature_key: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          feature_key?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gifts: {
        Row: {
          claimed_at: string | null
          created_at: string
          enabled_at: string | null
          expires_at: string | null
          gift_description: string | null
          gift_title: string
          gift_type: string
          id: string
          is_claimed: boolean
          is_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          enabled_at?: string | null
          expires_at?: string | null
          gift_description?: string | null
          gift_title?: string
          gift_type?: string
          id?: string
          is_claimed?: boolean
          is_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          enabled_at?: string | null
          expires_at?: string | null
          gift_description?: string | null
          gift_title?: string
          gift_type?: string
          id?: string
          is_claimed?: boolean
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          month: number
          target_value: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          goal_type: string
          id?: string
          month: number
          target_value?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          month?: number
          target_value?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          read_at: string | null
          sent_by: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          read_at?: string | null
          sent_by?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          read_at?: string | null
          sent_by?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_monthly_ranking: { Args: never; Returns: number }
      auto_complete_past_shows: { Args: never; Returns: number }
      cleanup_old_landing_visits: { Args: never; Returns: number }
      cleanup_old_notifications: { Args: never; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      expire_old_trials: { Args: never; Returns: number }
      get_alltime_show_totals: {
        Args: never
        Returns: {
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      get_artist_occupied_dates: {
        Args: { artist_user_id: string }
        Returns: {
          show_date: string
        }[]
      }
      get_artist_products: {
        Args: { artist_user_id: string }
        Returns: {
          description: string
          icon: string
          id: string
          name: string
          price: number
        }[]
      }
      get_monthly_show_ranking: {
        Args: never
        Returns: {
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      get_monthly_show_ranking_for_month: {
        Args: { target_month: number; target_year: number }
        Returns: {
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      get_yearly_show_totals: {
        Args: { target_year: number }
        Returns: {
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
