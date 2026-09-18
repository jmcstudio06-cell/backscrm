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
    PostgrestVersion: "14.5"
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
          booking_whatsapp: string | null
          budget_bg_image_url: string | null
          budget_brands: Json
          budget_cover_image_url: string | null
          budget_cover_type: string
          budget_gallery: Json
          budget_headline: string | null
          budget_intro: string | null
          budget_link_enabled: boolean
          budget_packages: Json
          budget_reviews: Json
          budget_video_url: string | null
          budget_videos: Json
          budget_whatsapp: string | null
          created_at: string
          instagram_url: string | null
          link_bg_image_url: string | null
          link_cover_type: string | null
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
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json
          budget_cover_image_url?: string | null
          budget_cover_type?: string
          budget_gallery?: Json
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean
          budget_packages?: Json
          budget_reviews?: Json
          budget_video_url?: string | null
          budget_videos?: Json
          budget_whatsapp?: string | null
          created_at?: string
          instagram_url?: string | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
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
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json
          budget_cover_image_url?: string | null
          budget_cover_type?: string
          budget_gallery?: Json
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean
          budget_packages?: Json
          budget_reviews?: Json
          budget_video_url?: string | null
          budget_videos?: Json
          budget_whatsapp?: string | null
          created_at?: string
          instagram_url?: string | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
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
          stage_changed_at: string
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
          stage_changed_at?: string
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
          stage_changed_at?: string
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
      consultoria_sessions: {
        Row: {
          anotacoes_admin: string | null
          created_at: string
          despesas: number | null
          faturamento: number | null
          id: string
          leads_convertidos: number | null
          leads_recebidos: number | null
          meta_faturamento: number | null
          meta_shows: number | null
          month: number
          observacoes_cantor: string | null
          pontos_fortes: string | null
          pontos_melhoria: string | null
          principais_cidades: string | null
          proximos_passos: string | null
          published_at: string | null
          shows_realizados: number | null
          status: string
          submitted_at: string | null
          ticket_medio: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          anotacoes_admin?: string | null
          created_at?: string
          despesas?: number | null
          faturamento?: number | null
          id?: string
          leads_convertidos?: number | null
          leads_recebidos?: number | null
          meta_faturamento?: number | null
          meta_shows?: number | null
          month: number
          observacoes_cantor?: string | null
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
          principais_cidades?: string | null
          proximos_passos?: string | null
          published_at?: string | null
          shows_realizados?: number | null
          status?: string
          submitted_at?: string | null
          ticket_medio?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          anotacoes_admin?: string | null
          created_at?: string
          despesas?: number | null
          faturamento?: number | null
          id?: string
          leads_convertidos?: number | null
          leads_recebidos?: number | null
          meta_faturamento?: number | null
          meta_shows?: number | null
          month?: number
          observacoes_cantor?: string | null
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
          principais_cidades?: string | null
          proximos_passos?: string | null
          published_at?: string | null
          shows_realizados?: number | null
          status?: string
          submitted_at?: string | null
          ticket_medio?: number | null
          updated_at?: string
          user_id?: string
          year?: number
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
      contract_signature_links: {
        Row: {
          artist_signature_ip: string | null
          artist_signature_name: string | null
          artist_signed_at: string | null
          client_signature_document: string | null
          client_signature_email: string | null
          client_signature_ip: string | null
          client_signature_name: string | null
          client_signed_at: string | null
          contract_id: string
          created_at: string
          expires_at: string
          id: string
          status: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_signature_ip?: string | null
          artist_signature_name?: string | null
          artist_signed_at?: string | null
          client_signature_document?: string | null
          client_signature_email?: string | null
          client_signature_ip?: string | null
          client_signature_name?: string | null
          client_signed_at?: string | null
          contract_id: string
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_signature_ip?: string | null
          artist_signature_name?: string | null
          artist_signed_at?: string | null
          client_signature_document?: string | null
          client_signature_email?: string | null
          client_signature_ip?: string | null
          client_signature_name?: string | null
          client_signed_at?: string | null
          contract_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signature_links_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
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
          client_rg: string | null
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
          client_rg?: string | null
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
          client_rg?: string | null
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
      dashboard_ads: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          cta_label: string
          cta_url: string
          description: string | null
          id: string
          image_url: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_label?: string
          cta_url: string
          description?: string | null
          id?: string
          image_url: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_label?: string
          cta_url?: string
          description?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          city: string | null
          created_at: string
          id: string
          name: string
          phone: string
          shows_per_month: string | null
          source: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          shows_per_month?: string | null
          source?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          shows_per_month?: string | null
          source?: string | null
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
          booking_whatsapp: string | null
          budget_bg_image_url: string | null
          budget_brands: Json
          budget_cover_image_url: string | null
          budget_cover_type: string
          budget_gallery: Json
          budget_headline: string | null
          budget_intro: string | null
          budget_link_enabled: boolean
          budget_packages: Json
          budget_reviews: Json
          budget_video_url: string | null
          budget_videos: Json
          budget_whatsapp: string | null
          cancel_at_period_end: boolean | null
          city: string | null
          consultoria_activated_at: string | null
          consultoria_active: boolean
          consultoria_day_of_week: number | null
          consultoria_preferred_days: Json | null
          consultoria_preferred_period: string | null
          consultoria_time: string | null
          created_at: string
          current_period_end: string | null
          delay_tolerance: string | null
          deposit_percentage: number | null
          email: string | null
          feature_blocks: Json | null
          financial_mode: string
          has_interval: boolean | null
          id: string
          instagram_url: string | null
          last_seen: string | null
          late_fee_percentage: number | null
          link_bg_image_url: string | null
          link_cover_type: string | null
          media_kit_url: string | null
          min_fee: number | null
          music_style: string | null
          name: string | null
          next_consultoria_at: string | null
          next_consultoria_notes: string | null
          next_consultoria_type: string | null
          onboarding_completed: boolean | null
          payment_deadline: string | null
          phone: string | null
          plan: string | null
          project_type: string | null
          radar_cep: string | null
          radar_city: string | null
          radar_configured_at: string | null
          radar_state: string | null
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
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json
          budget_cover_image_url?: string | null
          budget_cover_type?: string
          budget_gallery?: Json
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean
          budget_packages?: Json
          budget_reviews?: Json
          budget_video_url?: string | null
          budget_videos?: Json
          budget_whatsapp?: string | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          consultoria_activated_at?: string | null
          consultoria_active?: boolean
          consultoria_day_of_week?: number | null
          consultoria_preferred_days?: Json | null
          consultoria_preferred_period?: string | null
          consultoria_time?: string | null
          created_at?: string
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          financial_mode?: string
          has_interval?: boolean | null
          id?: string
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          next_consultoria_at?: string | null
          next_consultoria_notes?: string | null
          next_consultoria_type?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          radar_cep?: string | null
          radar_city?: string | null
          radar_configured_at?: string | null
          radar_state?: string | null
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
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json
          budget_cover_image_url?: string | null
          budget_cover_type?: string
          budget_gallery?: Json
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean
          budget_packages?: Json
          budget_reviews?: Json
          budget_video_url?: string | null
          budget_videos?: Json
          budget_whatsapp?: string | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          consultoria_activated_at?: string | null
          consultoria_active?: boolean
          consultoria_day_of_week?: number | null
          consultoria_preferred_days?: Json | null
          consultoria_preferred_period?: string | null
          consultoria_time?: string | null
          created_at?: string
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          financial_mode?: string
          has_interval?: boolean | null
          id?: string
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          next_consultoria_at?: string | null
          next_consultoria_notes?: string | null
          next_consultoria_type?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          radar_cep?: string | null
          radar_city?: string | null
          radar_configured_at?: string | null
          radar_state?: string | null
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
      profiles_backup_migracao: {
        Row: {
          accepted_payment: string | null
          action_radius: number | null
          artist_name: string | null
          avatar_url: string | null
          base_city: string | null
          bio: string | null
          booking_discount_percent: number | null
          booking_max_dates: number | null
          booking_method: string | null
          booking_min_dates_discount: number | null
          booking_show_products: boolean | null
          booking_whatsapp: string | null
          budget_bg_image_url: string | null
          budget_brands: Json | null
          budget_cover_image_url: string | null
          budget_cover_type: string | null
          budget_gallery: Json | null
          budget_headline: string | null
          budget_intro: string | null
          budget_link_enabled: boolean | null
          budget_packages: Json | null
          budget_reviews: Json | null
          budget_video_url: string | null
          budget_videos: Json | null
          budget_whatsapp: string | null
          cancel_at_period_end: boolean | null
          city: string | null
          consultoria_activated_at: string | null
          consultoria_active: boolean | null
          consultoria_day_of_week: number | null
          consultoria_preferred_days: Json | null
          consultoria_preferred_period: string | null
          consultoria_time: string | null
          created_at: string | null
          current_period_end: string | null
          delay_tolerance: string | null
          deposit_percentage: number | null
          email: string | null
          feature_blocks: Json | null
          financial_mode: string | null
          has_interval: boolean | null
          id: string | null
          instagram_url: string | null
          last_seen: string | null
          late_fee_percentage: number | null
          link_bg_image_url: string | null
          link_cover_type: string | null
          media_kit_url: string | null
          min_fee: number | null
          music_style: string | null
          name: string | null
          next_consultoria_at: string | null
          next_consultoria_notes: string | null
          next_consultoria_type: string | null
          onboarding_completed: boolean | null
          payment_deadline: string | null
          phone: string | null
          plan: string | null
          project_type: string | null
          radar_cep: string | null
          radar_city: string | null
          radar_configured_at: string | null
          radar_state: string | null
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
          updated_at: string | null
          user_id: string | null
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
          booking_discount_percent?: number | null
          booking_max_dates?: number | null
          booking_method?: string | null
          booking_min_dates_discount?: number | null
          booking_show_products?: boolean | null
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json | null
          budget_cover_image_url?: string | null
          budget_cover_type?: string | null
          budget_gallery?: Json | null
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean | null
          budget_packages?: Json | null
          budget_reviews?: Json | null
          budget_video_url?: string | null
          budget_videos?: Json | null
          budget_whatsapp?: string | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          consultoria_activated_at?: string | null
          consultoria_active?: boolean | null
          consultoria_day_of_week?: number | null
          consultoria_preferred_days?: Json | null
          consultoria_preferred_period?: string | null
          consultoria_time?: string | null
          created_at?: string | null
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          financial_mode?: string | null
          has_interval?: boolean | null
          id?: string | null
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          next_consultoria_at?: string | null
          next_consultoria_notes?: string | null
          next_consultoria_type?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          radar_cep?: string | null
          radar_city?: string | null
          radar_configured_at?: string | null
          radar_state?: string | null
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
          updated_at?: string | null
          user_id?: string | null
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
          booking_discount_percent?: number | null
          booking_max_dates?: number | null
          booking_method?: string | null
          booking_min_dates_discount?: number | null
          booking_show_products?: boolean | null
          booking_whatsapp?: string | null
          budget_bg_image_url?: string | null
          budget_brands?: Json | null
          budget_cover_image_url?: string | null
          budget_cover_type?: string | null
          budget_gallery?: Json | null
          budget_headline?: string | null
          budget_intro?: string | null
          budget_link_enabled?: boolean | null
          budget_packages?: Json | null
          budget_reviews?: Json | null
          budget_video_url?: string | null
          budget_videos?: Json | null
          budget_whatsapp?: string | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          consultoria_activated_at?: string | null
          consultoria_active?: boolean | null
          consultoria_day_of_week?: number | null
          consultoria_preferred_days?: Json | null
          consultoria_preferred_period?: string | null
          consultoria_time?: string | null
          created_at?: string | null
          current_period_end?: string | null
          delay_tolerance?: string | null
          deposit_percentage?: number | null
          email?: string | null
          feature_blocks?: Json | null
          financial_mode?: string | null
          has_interval?: boolean | null
          id?: string | null
          instagram_url?: string | null
          last_seen?: string | null
          late_fee_percentage?: number | null
          link_bg_image_url?: string | null
          link_cover_type?: string | null
          media_kit_url?: string | null
          min_fee?: number | null
          music_style?: string | null
          name?: string | null
          next_consultoria_at?: string | null
          next_consultoria_notes?: string | null
          next_consultoria_type?: string | null
          onboarding_completed?: boolean | null
          payment_deadline?: string | null
          phone?: string | null
          plan?: string | null
          project_type?: string | null
          radar_cep?: string | null
          radar_city?: string | null
          radar_configured_at?: string | null
          radar_state?: string | null
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
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      radar_places: {
        Row: {
          address: string | null
          category: string
          city: string
          created_at: string
          fetched_at: string
          geom: unknown
          id: string
          lat: number | null
          lng: number | null
          maps_uri: string | null
          name: string
          osm_id: string | null
          phone: string | null
          place_id: string
          place_type: string | null
          rating: number | null
          rating_count: number | null
          source: string | null
          state: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city: string
          created_at?: string
          fetched_at?: string
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          maps_uri?: string | null
          name: string
          osm_id?: string | null
          phone?: string | null
          place_id: string
          place_type?: string | null
          rating?: number | null
          rating_count?: number | null
          source?: string | null
          state: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string
          created_at?: string
          fetched_at?: string
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          maps_uri?: string | null
          name?: string
          osm_id?: string | null
          phone?: string | null
          place_id?: string
          place_type?: string | null
          rating?: number | null
          rating_count?: number | null
          source?: string | null
          state?: string
          website?: string | null
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
          link: string | null
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
          link?: string | null
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
          link?: string | null
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
          advance_received_date: string | null
          balance_due_date: string | null
          cachet: number
          checklist_template_id: string | null
          client_id: string | null
          created_at: string
          date: string
          duration_minutes: number | null
          end_time: string | null
          event_type: string | null
          id: string
          lead_id: string | null
          notes: string | null
          performance_format: string | null
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
          advance_received_date?: string | null
          balance_due_date?: string | null
          cachet?: number
          checklist_template_id?: string | null
          client_id?: string | null
          created_at?: string
          date: string
          duration_minutes?: number | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          performance_format?: string | null
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
          advance_received_date?: string | null
          balance_due_date?: string | null
          cachet?: number
          checklist_template_id?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          performance_format?: string | null
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
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
      workspace_members: {
        Row: {
          allowed_features: Json
          created_at: string
          email: string
          id: string
          is_active: boolean
          member_user_id: string
          owner_id: string
          permission_level: string
          role_label: string | null
          updated_at: string
        }
        Insert: {
          allowed_features?: Json
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          member_user_id: string
          owner_id: string
          permission_level?: string
          role_label?: string | null
          updated_at?: string
        }
        Update: {
          allowed_features?: Json
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          member_user_id?: string
          owner_id?: string
          permission_level?: string
          role_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      archive_monthly_ranking: { Args: never; Returns: number }
      auto_archive_old_budgets: { Args: never; Returns: number }
      auto_complete_past_shows: { Args: never; Returns: number }
      cleanup_old_notifications: { Args: never; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enablelongtransactions: { Args: never; Returns: string }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      expire_due_plans: { Args: never; Returns: number }
      expire_old_trials: { Args: never; Returns: number }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
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
      get_cloud_metrics: { Args: never; Returns: Json }
      get_full_monthly_show_ranking: {
        Args: { target_month: number; target_year: number }
        Returns: {
          show_count: number
          user_email: string
          user_id: string
          user_name: string
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
          avatar_url: string
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      get_signature_link_by_token: { Args: { _token: string }; Returns: Json }
      get_yearly_show_totals: {
        Args: { target_year: number }
        Returns: {
          show_count: number
          user_id: string
          user_name: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      member_can: {
        Args: { _action: string; _owner_id: string }
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
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      public_sign_contract: {
        Args: {
          _client_document?: string
          _client_email?: string
          _client_name: string
          _token: string
        }
        Returns: Json
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      search_radar_places: {
        Args: {
          p_categories: string[]
          p_lat: number
          p_lng: number
          p_radius_m: number
        }
        Returns: {
          address: string
          category: string
          city: string
          distance_m: number
          lat: number
          lng: number
          maps_uri: string
          name: string
          phone: string
          place_id: string
          place_type: string
          rating: number
          rating_count: number
          state: string
          website: string
        }[]
      }
      search_radar_places_by_cities: {
        Args: {
          p_categories: string[]
          p_cities: string[]
          p_lat: number
          p_lng: number
          p_state: string
        }
        Returns: {
          address: string
          category: string
          city: string
          distance_m: number
          lat: number
          lng: number
          maps_uri: string
          name: string
          phone: string
          place_id: string
          place_type: string
          rating: number
          rating_count: number
          state: string
          website: string
        }[]
      }
      slugify_artist_name: { Args: { _name: string }; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      workspace_owner_for: { Args: { _uid: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
