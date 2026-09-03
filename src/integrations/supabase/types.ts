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
      booking_messages: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          message: string
          request_id: string | null
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message: string
          request_id?: string | null
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message?: string
          request_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          name_te: string | null
          slug: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          name_te?: string | null
          slug: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          name_te?: string | null
          slug?: string
          type?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          reporter_id: string
          status: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          reporter_id: string
          status?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          reporter_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      farmer_profiles: {
        Row: {
          created_at: string
          crops: string[]
          farm_location: string | null
          farm_size: number | null
          farming_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crops?: string[]
          farm_location?: string | null
          farm_size?: number | null
          farming_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crops?: string[]
          farm_location?: string | null
          farm_size?: number | null
          farming_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_options: {
        Row: {
          conditions: string | null
          coverage: string | null
          crop: string
          id: string
          is_demo: boolean
          policy_period: string | null
          premium_info: string | null
          provider_contact: string | null
          provider_name: string
          provider_url: string | null
          scheme_name: string | null
          season: string | null
          state: string
          status: string
        }
        Insert: {
          conditions?: string | null
          coverage?: string | null
          crop: string
          id?: string
          is_demo?: boolean
          policy_period?: string | null
          premium_info?: string | null
          provider_contact?: string | null
          provider_name: string
          provider_url?: string | null
          scheme_name?: string | null
          season?: string | null
          state: string
          status?: string
        }
        Update: {
          conditions?: string | null
          coverage?: string | null
          crop?: string
          id?: string
          is_demo?: boolean
          policy_period?: string | null
          premium_info?: string | null
          provider_contact?: string | null
          provider_name?: string
          provider_url?: string | null
          scheme_name?: string | null
          season?: string | null
          state?: string
          status?: string
        }
        Relationships: []
      }
      insurance_support_tickets: {
        Row: {
          admin_response: string | null
          attachments: string[]
          category: string
          created_at: string
          crop: string | null
          description: string
          id: string
          policy_number: string | null
          provider: string | null
          status: string
          ticket_code: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          attachments?: string[]
          category: string
          created_at?: string
          crop?: string | null
          description: string
          id?: string
          policy_number?: string | null
          provider?: string | null
          status?: string
          ticket_code?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          attachments?: string[]
          category?: string
          created_at?: string
          crop?: string | null
          description?: string
          id?: string
          policy_number?: string | null
          provider?: string | null
          status?: string
          ticket_code?: string
          user_id?: string
        }
        Relationships: []
      }
      labour_applications: {
        Row: {
          applied_at: string
          id: string
          job_id: string
          labourer_id: string
          message: string | null
          status: string
        }
        Insert: {
          applied_at?: string
          id?: string
          job_id: string
          labourer_id: string
          message?: string | null
          status?: string
        }
        Update: {
          applied_at?: string
          id?: string
          job_id?: string
          labourer_id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "labour_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "labour_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_applications_labourer_id_fkey"
            columns: ["labourer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_jobs: {
        Row: {
          accommodation: boolean
          category: string
          contact_preference: string
          created_at: string
          crop: string | null
          description: string | null
          district: string | null
          duration: string | null
          farmer_id: string
          food: boolean
          id: string
          is_demo: boolean
          mandal: string | null
          state: string | null
          status: string
          title: string
          village: string | null
          wage: number
          wage_type: string
          work_date: string | null
          workers_required: number
        }
        Insert: {
          accommodation?: boolean
          category: string
          contact_preference?: string
          created_at?: string
          crop?: string | null
          description?: string | null
          district?: string | null
          duration?: string | null
          farmer_id: string
          food?: boolean
          id?: string
          is_demo?: boolean
          mandal?: string | null
          state?: string | null
          status?: string
          title: string
          village?: string | null
          wage: number
          wage_type?: string
          work_date?: string | null
          workers_required?: number
        }
        Update: {
          accommodation?: boolean
          category?: string
          contact_preference?: string
          created_at?: string
          crop?: string | null
          description?: string | null
          district?: string | null
          duration?: string | null
          farmer_id?: string
          food?: boolean
          id?: string
          is_demo?: boolean
          mandal?: string | null
          state?: string | null
          status?: string
          title?: string
          village?: string | null
          wage?: number
          wage_type?: string
          work_date?: string | null
          workers_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "labour_jobs_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_profiles: {
        Row: {
          availability: string
          completed_jobs: number
          created_at: string
          crops_experience: string[]
          experience_years: number
          id: string
          preferred_radius_km: number
          preferred_wage: number | null
          rating: number
          skills: string[]
          user_id: string
          wage_type: string
        }
        Insert: {
          availability?: string
          completed_jobs?: number
          created_at?: string
          crops_experience?: string[]
          experience_years?: number
          id?: string
          preferred_radius_km?: number
          preferred_wage?: number | null
          rating?: number
          skills?: string[]
          user_id: string
          wage_type?: string
        }
        Update: {
          availability?: string
          completed_jobs?: number
          created_at?: string
          crops_experience?: string[]
          experience_years?: number
          id?: string
          preferred_radius_km?: number
          preferred_wage?: number | null
          rating?: number
          skills?: string[]
          user_id?: string
          wage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "labour_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read_status: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read_status?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read_status?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          seller_id: string | null
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          seller_id?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          delivery_fee: number
          discount: number
          id: string
          order_status: string
          payment_method: string
          payment_status: string
          phone: string
          subtotal: number
          total: number
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          delivery_fee?: number
          discount?: number
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          phone: string
          subtotal?: number
          total?: number
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          delivery_fee?: number
          discount?: number
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          phone?: string
          subtotal?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      products: {
        Row: {
          approval_status: string
          benefits: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_demo: boolean
          location: string | null
          name: string
          name_te: string | null
          price: number
          rating: number
          seller_id: string
          status: string
          stock: number
          unit: string
          usage_instructions: string | null
        }
        Insert: {
          approval_status?: string
          benefits?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_demo?: boolean
          location?: string | null
          name: string
          name_te?: string | null
          price: number
          rating?: number
          seller_id: string
          status?: string
          stock?: number
          unit?: string
          usage_instructions?: string | null
        }
        Update: {
          approval_status?: string
          benefits?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_demo?: boolean
          location?: string | null
          name?: string
          name_te?: string | null
          price?: number
          rating?: number
          seller_id?: string
          status?: string
          stock?: number
          unit?: string
          usage_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          is_demo: boolean
          language: string
          mandal: string | null
          mobile: string | null
          profile_image: string | null
          state: string | null
          status: string
          verification_status: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          language?: string
          mandal?: string | null
          mobile?: string | null
          profile_image?: string | null
          state?: string | null
          status?: string
          verification_status?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          language?: string
          mandal?: string | null
          mobile?: string | null
          profile_image?: string | null
          state?: string | null
          status?: string
          verification_status?: string
          village?: string | null
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          note: string | null
          provider_id: string
          start_time: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          note?: string | null
          provider_id: string
          start_time?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          note?: string | null
          provider_id?: string
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_documents: {
        Row: {
          admin_note: string | null
          created_at: string
          doc_type: string
          file_url: string
          id: string
          provider_id: string
          status: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          doc_type: string
          file_url: string
          id?: string
          provider_id: string
          status?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          doc_type?: string
          file_url?: string
          id?: string
          provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_equipment: {
        Row: {
          brand: string | null
          created_at: string
          delivery_available: boolean
          description: string | null
          horsepower: string | null
          id: string
          images: string[]
          location: string | null
          model: string | null
          name: string
          provider_id: string
          rental_price_day: number | null
          rental_price_hour: number | null
          security_deposit: number | null
          status: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          delivery_available?: boolean
          description?: string | null
          horsepower?: string | null
          id?: string
          images?: string[]
          location?: string | null
          model?: string | null
          name: string
          provider_id: string
          rental_price_day?: number | null
          rental_price_hour?: number | null
          security_deposit?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          delivery_available?: boolean
          description?: string | null
          horsepower?: string | null
          id?: string
          images?: string[]
          location?: string | null
          model?: string | null
          name?: string
          provider_id?: string
          rental_price_day?: number | null
          rental_price_hour?: number | null
          security_deposit?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_equipment_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_locations: {
        Row: {
          created_at: string
          district: string | null
          id: string
          mandal: string | null
          provider_id: string
          radius_km: number
          state: string | null
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          mandal?: string | null
          provider_id: string
          radius_km?: number
          state?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          mandal?: string | null
          provider_id?: string
          radius_km?: number
          state?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_locations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          created_at: string
          equipment_details: string | null
          id: string
          materials_supplied_by: string
          minimum_booking: string | null
          notes: string | null
          price: number | null
          price_per_hour: number | null
          pricing_unit: string
          provider_id: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_details?: string | null
          id?: string
          materials_supplied_by?: string
          minimum_booking?: string | null
          notes?: string | null
          price?: number | null
          price_per_hour?: number | null
          pricing_unit?: string
          provider_id: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_details?: string | null
          id?: string
          materials_supplied_by?: string
          minimum_booking?: string | null
          notes?: string | null
          price?: number | null
          price_per_hour?: number | null
          pricing_unit?: string
          provider_id?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          job_id: string | null
          product_id: string | null
          rating: number
          reviewer_id: string
          status: string
          target_user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          product_id?: string | null
          rating: number
          reviewer_id: string
          status?: string
          target_user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          product_id?: string | null
          rating?: number
          reviewer_id?: string
          status?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "labour_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          business_name: string
          business_type: string | null
          created_at: string
          description: string | null
          id: string
          user_id: string
          verification_status: string
        }
        Insert: {
          business_name: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          business_name?: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          agreed_price: number
          booking_code: string
          booking_date: string | null
          booking_status: string
          cancellation_reason: string | null
          cancelled_by: string | null
          commission_amount: number
          commission_percent: number
          created_at: string
          farm_size_acres: number | null
          farmer_id: string
          id: string
          location: string | null
          payment_method: string | null
          payment_status: string
          provider_id: string
          provider_payout: number
          quote_id: string | null
          request_id: string | null
          reschedule_reason: string | null
          reschedule_requested_by: string | null
          service_id: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          agreed_price?: number
          booking_code?: string
          booking_date?: string | null
          booking_status?: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          farm_size_acres?: number | null
          farmer_id: string
          id?: string
          location?: string | null
          payment_method?: string | null
          payment_status?: string
          provider_id: string
          provider_payout?: number
          quote_id?: string | null
          request_id?: string | null
          reschedule_reason?: string | null
          reschedule_requested_by?: string | null
          service_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          agreed_price?: number
          booking_code?: string
          booking_date?: string | null
          booking_status?: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          farm_size_acres?: number | null
          farmer_id?: string
          id?: string
          location?: string | null
          payment_method?: string | null
          payment_status?: string
          provider_id?: string
          provider_payout?: number
          quote_id?: string | null
          request_id?: string | null
          reschedule_reason?: string | null
          reschedule_requested_by?: string | null
          service_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          description_te: string | null
          icon: string
          id: string
          name: string
          name_te: string | null
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_te?: string | null
          icon?: string
          id?: string
          name: string
          name_te?: string | null
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_te?: string | null
          icon?: string
          id?: string
          name?: string
          name_te?: string | null
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_complaints: {
        Row: {
          attachments: string[]
          booking_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          reporter_id: string
          resolution: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attachments?: string[]
          booking_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          reporter_id: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attachments?: string[]
          booking_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          reporter_id?: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_complaints_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_complaints_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          about: string | null
          accepts_urgent: boolean
          availability_status: string
          business_name: string
          completed_jobs: number
          created_at: string
          district: string | null
          experience_years: number
          id: string
          is_demo: boolean
          mandal: string | null
          max_bookings_per_day: number
          mobile_verified: boolean
          profile_image: string | null
          rating: number
          rating_count: number
          response_rate: number
          service_radius_km: number
          state: string | null
          status: string
          updated_at: string
          user_id: string
          verification_status: string
          village: string | null
          working_days: string[]
          working_hours_end: string
          working_hours_start: string
        }
        Insert: {
          about?: string | null
          accepts_urgent?: boolean
          availability_status?: string
          business_name: string
          completed_jobs?: number
          created_at?: string
          district?: string | null
          experience_years?: number
          id?: string
          is_demo?: boolean
          mandal?: string | null
          max_bookings_per_day?: number
          mobile_verified?: boolean
          profile_image?: string | null
          rating?: number
          rating_count?: number
          response_rate?: number
          service_radius_km?: number
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_status?: string
          village?: string | null
          working_days?: string[]
          working_hours_end?: string
          working_hours_start?: string
        }
        Update: {
          about?: string | null
          accepts_urgent?: boolean
          availability_status?: string
          business_name?: string
          completed_jobs?: number
          created_at?: string
          district?: string | null
          experience_years?: number
          id?: string
          is_demo?: boolean
          mandal?: string | null
          max_bookings_per_day?: number
          mobile_verified?: boolean
          profile_image?: string | null
          rating?: number
          rating_count?: number
          response_rate?: number
          service_radius_km?: number
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          village?: string | null
          working_days?: string[]
          working_hours_end?: string
          working_hours_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quotes: {
        Row: {
          additional_fee: number
          base_price: number
          created_at: string
          expires_at: string | null
          id: string
          locked: boolean
          notes: string | null
          provider_id: string
          request_id: string
          status: string
          total: number
          transport_fee: number
          updated_at: string
        }
        Insert: {
          additional_fee?: number
          base_price?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          locked?: boolean
          notes?: string | null
          provider_id: string
          request_id: string
          status?: string
          total?: number
          transport_fee?: number
          updated_at?: string
        }
        Update: {
          additional_fee?: number
          base_price?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          locked?: boolean
          notes?: string | null
          provider_id?: string
          request_id?: string
          status?: string
          total?: number
          transport_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quotes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget: number | null
          category_id: string | null
          created_at: string
          crop: string | null
          description: string | null
          district: string | null
          duration: string | null
          equipment_required: string | null
          farm_size_acres: number | null
          farmer_id: string
          id: string
          is_open_requirement: boolean
          is_urgent: boolean
          location_note: string | null
          mandal: string | null
          photos: string[]
          preferred_date: string | null
          preferred_time: string | null
          provider_id: string | null
          request_code: string
          service_id: string | null
          state: string | null
          status: string
          title: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          budget?: number | null
          category_id?: string | null
          created_at?: string
          crop?: string | null
          description?: string | null
          district?: string | null
          duration?: string | null
          equipment_required?: string | null
          farm_size_acres?: number | null
          farmer_id: string
          id?: string
          is_open_requirement?: boolean
          is_urgent?: boolean
          location_note?: string | null
          mandal?: string | null
          photos?: string[]
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id?: string | null
          request_code?: string
          service_id?: string | null
          state?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          budget?: number | null
          category_id?: string | null
          created_at?: string
          crop?: string | null
          description?: string | null
          district?: string | null
          duration?: string | null
          equipment_required?: string | null
          farm_size_acres?: number | null
          farmer_id?: string
          id?: string
          is_open_requirement?: boolean
          is_urgent?: boolean
          location_note?: string | null
          mandal?: string | null
          photos?: string[]
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id?: string | null
          request_code?: string
          service_id?: string | null
          state?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          behaviour_rating: number | null
          booking_id: string
          comment: string | null
          created_at: string
          direction: string
          equipment_rating: number | null
          id: string
          provider_id: string | null
          quality_rating: number | null
          rating: number
          reviewer_id: string
          status: string
          target_user_id: string | null
          timeliness_rating: number | null
          value_rating: number | null
        }
        Insert: {
          behaviour_rating?: number | null
          booking_id: string
          comment?: string | null
          created_at?: string
          direction?: string
          equipment_rating?: number | null
          id?: string
          provider_id?: string | null
          quality_rating?: number | null
          rating: number
          reviewer_id: string
          status?: string
          target_user_id?: string | null
          timeliness_rating?: number | null
          value_rating?: number | null
        }
        Update: {
          behaviour_rating?: number | null
          booking_id?: string
          comment?: string | null
          created_at?: string
          direction?: string
          equipment_rating?: number | null
          id?: string
          provider_id?: string | null
          quality_rating?: number | null
          rating?: number
          reviewer_id?: string
          status?: string
          target_user_id?: string | null
          timeliness_rating?: number | null
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          name_te: string | null
          pricing_type: string
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_te?: string | null
          pricing_type?: string
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_te?: string | null
          pricing_type?: string
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_provider_owner: { Args: { _provider_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "farmer" | "labourer" | "seller" | "admin" | "provider"
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
      app_role: ["farmer", "labourer", "seller", "admin", "provider"],
    },
  },
} as const
