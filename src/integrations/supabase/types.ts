export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_messages: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          message_type: string | null
          send_email: boolean | null
          target_audience: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: string | null
          send_email?: boolean | null
          target_audience?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: string | null
          send_email?: boolean | null
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_user_messages: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_cache: {
        Row: {
          cache_data: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          updated_at: string
        }
        Insert: {
          cache_data: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          updated_at?: string
        }
        Update: {
          cache_data?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          issue_date: string | null
          issuer: string | null
          linked_item_id: string | null
          linked_section: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          issue_date?: string | null
          issuer?: string | null
          linked_item_id?: string | null
          linked_section: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          issue_date?: string | null
          issuer?: string | null
          linked_item_id?: string | null
          linked_section?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          content: string | null
          content_validation_score: number | null
          created_at: string
          id: string
          is_complete: boolean | null
          job_company: string | null
          job_description: string | null
          job_position: string | null
          status: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_validation_score?: number | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          job_company?: string | null
          job_description?: string | null
          job_position?: string | null
          status?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_validation_score?: number | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          job_company?: string | null
          job_description?: string | null
          job_position?: string | null
          status?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          action_type: string
          created_at: string
          credits_used: number
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          credits_used: number
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          credits_used?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      custom_branding: {
        Row: {
          accent_color: string
          background_color: string
          created_at: string
          font_family: string
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          text_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          created_at?: string
          font_family?: string
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          created_at?: string
          font_family?: string
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          application_email_body: string | null
          application_email_subject: string | null
          application_status: string
          applied_at: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          job_description: string | null
          job_title: string
          job_type: string | null
          job_url: string | null
          location: string | null
          notes: string | null
          priority: string | null
          response_date: string | null
          response_received: boolean | null
          resume_id: string | null
          salary_range: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_email_body?: string | null
          application_email_subject?: string | null
          application_status?: string
          applied_at?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_title: string
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          priority?: string | null
          response_date?: string | null
          response_received?: boolean | null
          resume_id?: string | null
          salary_range?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_email_body?: string | null
          application_email_subject?: string | null
          application_status?: string
          applied_at?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_title?: string
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          priority?: string | null
          response_date?: string | null
          response_received?: boolean | null
          resume_id?: string | null
          salary_range?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          job_type: string
          max_retries: number
          priority: number
          processed_at: string | null
          result_data: Json | null
          retry_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          job_type: string
          max_retries?: number
          priority?: number
          processed_at?: string | null
          result_data?: Json | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          job_type?: string
          max_retries?: number
          priority?: number
          processed_at?: string | null
          result_data?: Json | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          metadata: Json | null
          method: string
          response_time_ms: number
          status_code: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method: string
          response_time_ms: number
          status_code: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          response_time_ms?: number
          status_code?: number
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio_intro_text: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_online: boolean | null
          last_activity_at: string | null
          last_login_at: string | null
          public_resume_enabled: boolean | null
          public_resume_id: string | null
          updated_at: string
          username: string | null
          video_bio_url: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio_intro_text?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          public_resume_enabled?: boolean | null
          public_resume_id?: string | null
          updated_at?: string
          username?: string | null
          video_bio_url?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio_intro_text?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          public_resume_enabled?: boolean | null
          public_resume_id?: string | null
          updated_at?: string
          username?: string | null
          video_bio_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_public_resume_id_fkey"
            columns: ["public_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          application_status: string | null
          branding_id: string | null
          content_validation_score: number | null
          created_at: string
          data: Json
          downloaded_count: number | null
          generated_count: number | null
          id: string
          is_complete: boolean | null
          job_company: string | null
          job_description: string | null
          job_position: string | null
          tags: string[] | null
          template: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_status?: string | null
          branding_id?: string | null
          content_validation_score?: number | null
          created_at?: string
          data?: Json
          downloaded_count?: number | null
          generated_count?: number | null
          id?: string
          is_complete?: boolean | null
          job_company?: string | null
          job_description?: string | null
          job_position?: string | null
          tags?: string[] | null
          template?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_status?: string | null
          branding_id?: string | null
          content_validation_score?: number | null
          created_at?: string
          data?: Json
          downloaded_count?: number | null
          generated_count?: number | null
          id?: string
          is_complete?: boolean | null
          job_company?: string | null
          job_description?: string | null
          job_position?: string | null
          tags?: string[] | null
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_branding_id_fkey"
            columns: ["branding_id"]
            isOneToOne: false
            referencedRelation: "custom_branding"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          endpoint: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          current_credits: number
          daily_reset_at: string
          id: string
          total_used_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_credits?: number
          daily_reset_at?: string
          id?: string
          total_used_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_credits?: number
          daily_reset_at?: string
          id?: string
          total_used_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "admin_messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_credits: {
        Args: {
          p_user_id: string
          p_action_type: string
          p_credits_amount: number
          p_description?: string
        }
        Returns: boolean
      }
      ensure_all_users_have_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_endpoint?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      reset_daily_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_job_status: {
        Args: {
          job_id: string
          new_status: string
          result_data?: Json
          error_msg?: string
        }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
