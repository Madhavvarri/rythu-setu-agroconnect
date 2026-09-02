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
    }
    Enums: {
      app_role: "farmer" | "labourer" | "seller" | "admin"
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
      app_role: ["farmer", "labourer", "seller", "admin"],
    },
  },
} as const
