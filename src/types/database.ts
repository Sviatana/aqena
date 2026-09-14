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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assistants: {
        Row: {
          brand_color: string
          created_at: string
          description: string
          fallback_message: string
          id: string
          instructions: string
          is_published: boolean
          name: string
          owner_id: string
          public_id: string
          status: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          brand_color?: string
          created_at?: string
          description?: string
          fallback_message?: string
          id?: string
          instructions?: string
          is_published?: boolean
          name: string
          owner_id: string
          public_id?: string
          status?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          brand_color?: string
          created_at?: string
          description?: string
          fallback_message?: string
          id?: string
          instructions?: string
          is_published?: boolean
          name?: string
          owner_id?: string
          public_id?: string
          status?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assistant_id: string
          channel: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assistant_id: string
          channel?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assistant_id?: string
          channel?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          assistant_id: string
          chunk_index: number
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
          source_id: string
          token_count: number | null
        }
        Insert: {
          assistant_id: string
          chunk_index: number
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          source_id: string
          token_count?: number | null
        }
        Update: {
          assistant_id?: string
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          source_id?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_source_assistant_fk"
            columns: ["source_id", "assistant_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id", "assistant_id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          assistant_id: string
          content_text: string | null
          created_at: string
          error_message: string | null
          id: string
          mime_type: string | null
          original_file_name: string | null
          size_bytes: number | null
          source_type: string
          status: string
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          content_text?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mime_type?: string | null
          original_file_name?: string | null
          size_bytes?: number | null
          source_type: string
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          content_text?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mime_type?: string | null
          original_file_name?: string | null
          size_bytes?: number | null
          source_type?: string
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          citations: Json
          content: string
          conversation_id: string
          created_at: string
          id: string
          input_tokens: number | null
          output_tokens: number | null
          role: string
        }
        Insert: {
          citations?: Json
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          role: string
        }
        Update: {
          citations?: Json
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_requests: {
        Row: {
          assistant_id: string | null
          company_name: string | null
          contact_method: string
          contact_value: string
          created_at: string
          currency: string
          customer_name: string
          email: string
          id: string
          note: string | null
          offer_code: string
          price_lock_months: number
          pricing_region: string
          promo_amount_minor: number
          requested_plan: string
          standard_amount_minor: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_id?: string | null
          company_name?: string | null
          contact_method: string
          contact_value: string
          created_at?: string
          currency: string
          customer_name: string
          email: string
          id?: string
          note?: string | null
          offer_code?: string
          price_lock_months?: number
          pricing_region: string
          promo_amount_minor: number
          requested_plan?: string
          standard_amount_minor: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_id?: string | null
          company_name?: string | null
          contact_method?: string
          contact_value?: string
          created_at?: string
          currency?: string
          customer_name?: string
          email?: string
          id?: string
          note?: string | null
          offer_code?: string
          price_lock_months?: number
          pricing_region?: string
          promo_amount_minor?: number
          requested_plan?: string
          standard_amount_minor?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_mode: string
          created_at: string
          current_period_end: string | null
          current_period_start: string
          mock_checkout_completed_at: string | null
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_mode?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          mock_checkout_completed_at?: string | null
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_mode?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          mock_checkout_completed_at?: string | null
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_monthly: {
        Row: {
          message_count: number
          month: string
          playground_message_count: number
          user_id: string
          widget_message_count: number
        }
        Insert: {
          message_count?: number
          month?: string
          playground_message_count?: number
          user_id: string
          widget_message_count?: number
        }
        Update: {
          message_count?: number
          month?: string
          playground_message_count?: number
          user_id?: string
          widget_message_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_widget_rate_limit: {
        Args: {
          p_key_hash: string
        }
        Returns: {
          allowed: boolean
          requests_used: number
          retry_after_seconds: number
        }[]
      }
      commit_playground_exchange: {
        Args: {
          p_assistant_content: string
          p_assistant_id: string
          p_citations: Json
          p_conversation_id: string
          p_input_tokens: number
          p_output_tokens: number
          p_user_content: string
        }
        Returns: {
          allowed: boolean
          assistant_message_id: string
          message_limit: number
          messages_used: number
          plan_name: string
          user_message_id: string
        }[]
      }
      commit_widget_exchange: {
        Args: {
          p_assistant_content: string
          p_citations: Json
          p_conversation_id: string
          p_input_tokens: number
          p_output_tokens: number
          p_public_id: string
          p_user_content: string
        }
        Returns: {
          allowed: boolean
          assistant_message_id: string
          message_limit: number
          messages_used: number
          user_message_id: string
        }[]
      }
      match_knowledge_chunks: {
        Args: {
          p_assistant_id: string
          p_match_count?: number
          p_match_threshold?: number
          p_query_embedding: string
        }
        Returns: {
          chunk_id: string
          content: string
          metadata: Json
          similarity: number
          source_id: string
          source_title: string
        }[]
      }
      match_public_knowledge_chunks: {
        Args: {
          p_match_count?: number
          p_match_threshold?: number
          p_public_id: string
          p_query_embedding: string
        }
        Returns: {
          chunk_id: string
          content: string
          metadata: Json
          similarity: number
          source_id: string
          source_title: string
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
  public: {
    Enums: {},
  },
} as const
