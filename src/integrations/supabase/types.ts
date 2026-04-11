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
      activity_log: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          icon: string | null
          id: string
          message: string
          message_fa: string | null
          type: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          message: string
          message_fa?: string | null
          type: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          message?: string
          message_fa?: string | null
          type?: string
        }
        Relationships: []
      }
      approvals: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["approval_type"]
          id: string
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["approval_type"]
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["approval_type"]
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: []
      }
      businesses: {
        Row: {
          active_campaigns: number
          address: string | null
          category_id: string | null
          city: string | null
          completed_collabs: number
          contact_name: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          rating: number | null
          status: Database["public"]["Enums"]["entity_status"]
          submitted_at: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          active_campaigns?: number
          address?: string | null
          category_id?: string | null
          city?: string | null
          completed_collabs?: number
          contact_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          submitted_at?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          active_campaigns?: number
          address?: string | null
          category_id?: string | null
          city?: string | null
          completed_collabs?: number
          contact_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          submitted_at?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_influencers: {
        Row: {
          assigned_at: string
          campaign_id: string
          id: string
          influencer_id: string
        }
        Insert: {
          assigned_at?: string
          campaign_id: string
          id?: string
          influencer_id: string
        }
        Update: {
          assigned_at?: string
          campaign_id?: string
          id?: string
          influencer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: string | null
          business_id: string
          category_id: string | null
          city: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          performance: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          business_id: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          performance?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          business_id?: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          performance?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          name_fa: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_fa?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_fa?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_name: string | null
          sender_role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_role: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_role?: Database["public"]["Enums"]["message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_online: boolean
          is_pinned: boolean
          last_message: string | null
          last_message_at: string | null
          participant_entity_id: string | null
          participant_name: string
          participant_role: Database["public"]["Enums"]["message_role"]
          unread_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean
          is_pinned?: boolean
          last_message?: string | null
          last_message_at?: string | null
          participant_entity_id?: string | null
          participant_name: string
          participant_role: Database["public"]["Enums"]["message_role"]
          unread_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean
          is_pinned?: boolean
          last_message?: string | null
          last_message_at?: string | null
          participant_entity_id?: string | null
          participant_name?: string
          participant_role?: Database["public"]["Enums"]["message_role"]
          unread_count?: number
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
      influencers: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          bookings_count: number
          campaigns_count: number
          category_id: string | null
          city: string | null
          created_at: string
          engagement: number | null
          followers: number
          gender: Database["public"]["Enums"]["gender_type"] | null
          handle: string | null
          id: string
          name: string
          reviews_count: number
          status: Database["public"]["Enums"]["entity_status"]
          submitted_at: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bookings_count?: number
          campaigns_count?: number
          category_id?: string | null
          city?: string | null
          created_at?: string
          engagement?: number | null
          followers?: number
          gender?: Database["public"]["Enums"]["gender_type"] | null
          handle?: string | null
          id?: string
          name: string
          reviews_count?: number
          status?: Database["public"]["Enums"]["entity_status"]
          submitted_at?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bookings_count?: number
          campaigns_count?: number
          category_id?: string | null
          city?: string | null
          created_at?: string
          engagement?: number | null
          followers?: number
          gender?: Database["public"]["Enums"]["gender_type"] | null
          handle?: string | null
          id?: string
          name?: string
          reviews_count?: number
          status?: Database["public"]["Enums"]["entity_status"]
          submitted_at?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "influencers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          business_id: string
          campaign_id: string | null
          city: string | null
          created_at: string
          id: string
          influencer_id: string
          location: string | null
          meeting_date: string
          meeting_time: string
          notes: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          updated_at: string
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          location?: string | null
          meeting_date: string
          meeting_time: string
          notes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string
          campaign_id: string | null
          content: string | null
          created_at: string
          id: string
          influencer_id: string
          media_urls: string[] | null
          rating: number
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          media_urls?: string[] | null
          rating: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          media_urls?: string[] | null
          rating?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
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
      user_credentials: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["credential_entity_type"]
          id: string
          keyword: string | null
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["credential_entity_type"]
          id?: string
          keyword?: string | null
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["credential_entity_type"]
          id?: string
          keyword?: string | null
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
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
      approval_status: "pending" | "approved" | "rejected"
      approval_type: "influencer" | "business"
      campaign_status:
        | "pending"
        | "active"
        | "scheduled"
        | "completed"
        | "rejected"
        | "paused"
      credential_entity_type: "blogger" | "business"
      entity_status: "pending" | "active" | "suspended" | "rejected"
      gender_type: "male" | "female" | "other"
      meeting_status: "pending" | "confirmed" | "cancelled" | "completed"
      message_role: "influencer" | "business" | "admin"
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
      approval_status: ["pending", "approved", "rejected"],
      approval_type: ["influencer", "business"],
      campaign_status: [
        "pending",
        "active",
        "scheduled",
        "completed",
        "rejected",
        "paused",
      ],
      credential_entity_type: ["blogger", "business"],
      entity_status: ["pending", "active", "suspended", "rejected"],
      gender_type: ["male", "female", "other"],
      meeting_status: ["pending", "confirmed", "cancelled", "completed"],
      message_role: ["influencer", "business", "admin"],
    },
  },
} as const
