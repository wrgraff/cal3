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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          chest_cm: number | null
          created_at: string
          date: string
          hips_cm: number | null
          id: string
          updated_at: string
          user_id: string
          waist_cm: number | null
        }
        Insert: {
          chest_cm?: number | null
          created_at?: string
          date: string
          hips_cm?: number | null
          id?: string
          updated_at?: string
          user_id: string
          waist_cm?: number | null
        }
        Update: {
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          created_at: string
          date: string
          evening_weight_kg: number | null
          id: string
          morning_weight_kg: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          evening_weight_kg?: number | null
          id?: string
          morning_weight_kg?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          evening_weight_kg?: number | null
          id?: string
          morning_weight_kg?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_entry_tags: {
        Row: {
          created_at: string
          id: string
          tag: Database["public"]["Enums"]["weight_entry_tag"]
          user_id: string
          weight_entry_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: Database["public"]["Enums"]["weight_entry_tag"]
          user_id: string
          weight_entry_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: Database["public"]["Enums"]["weight_entry_tag"]
          user_id?: string
          weight_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_entry_tags_weight_entry_id_fkey"
            columns: ["weight_entry_id"]
            isOneToOne: false
            referencedRelation: "weight_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_goals: {
        Row: {
          calculated_target_date: string
          created_at: string
          id: string
          revision_of_goal_id: string | null
          start_date: string
          start_weight_kg: number
          status: Database["public"]["Enums"]["weight_goal_status"]
          target_weight_kg: number
          updated_at: string
          user_id: string
          weekly_loss_kg: number
        }
        Insert: {
          calculated_target_date: string
          created_at?: string
          id?: string
          revision_of_goal_id?: string | null
          start_date: string
          start_weight_kg: number
          status?: Database["public"]["Enums"]["weight_goal_status"]
          target_weight_kg: number
          updated_at?: string
          user_id: string
          weekly_loss_kg?: number
        }
        Update: {
          calculated_target_date?: string
          created_at?: string
          id?: string
          revision_of_goal_id?: string | null
          start_date?: string
          start_weight_kg?: number
          status?: Database["public"]["Enums"]["weight_goal_status"]
          target_weight_kg?: number
          updated_at?: string
          user_id?: string
          weekly_loss_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_goals_revision_of_goal_id_fkey"
            columns: ["revision_of_goal_id"]
            isOneToOne: false
            referencedRelation: "weight_goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_weight_goal_revision: {
        Args: {
          p_start_date: string
          p_start_weight_kg: number
          p_target_weight_kg: number
        }
        Returns: string
      }
      upsert_weight_entry_with_tags: {
        Args: {
          p_date: string
          p_evening_weight_kg?: number
          p_morning_weight_kg?: number
          p_tags?: Database["public"]["Enums"]["weight_entry_tag"][]
        }
        Returns: string
      }
    }
    Enums: {
      weight_entry_tag:
        | "late_dinner"
        | "alcohol"
        | "training"
        | "illness"
        | "travel"
        | "other"
      weight_goal_status: "active" | "archived" | "reached"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      weight_entry_tag: [
        "late_dinner",
        "alcohol",
        "training",
        "illness",
        "travel",
        "other",
      ],
      weight_goal_status: ["active", "archived", "reached"],
    },
  },
} as const
