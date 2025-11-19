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
      approvals: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          reviewed_at: string | null
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reviewed_at?: string | null
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reviewed_at?: string | null
          reviewer_id?: string
          reviewer_role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approvals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_tracking: {
        Row: {
          allocated_budget: number
          created_at: string | null
          fiscal_year: number
          id: string
          spent_budget: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_budget: number
          created_at?: string | null
          fiscal_year: number
          id?: string
          spent_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_budget?: number
          created_at?: string | null
          fiscal_year?: number
          id?: string
          spent_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          clinic_name: string
          clinical_data: Json | null
          created_at: string | null
          decline_reason: string | null
          discounted_cost: number | null
          email: string
          first_name: string
          hubspot_form_id: string | null
          id: string
          last_name: string
          liberatoria_confirmed_at: string | null
          liberatoria_confirmed_by: string | null
          liberatoria_signed: boolean | null
          panoramica_url: string | null
          patient_story: string
          pdc_cost: number | null
          pdc_number: string
          primoup_link: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string | null
        }
        Insert: {
          clinic_name: string
          clinical_data?: Json | null
          created_at?: string | null
          decline_reason?: string | null
          discounted_cost?: number | null
          email: string
          first_name: string
          hubspot_form_id?: string | null
          id?: string
          last_name: string
          liberatoria_confirmed_at?: string | null
          liberatoria_confirmed_by?: string | null
          liberatoria_signed?: boolean | null
          panoramica_url?: string | null
          patient_story: string
          pdc_cost?: number | null
          pdc_number: string
          primoup_link?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string | null
        }
        Update: {
          clinic_name?: string
          clinical_data?: Json | null
          created_at?: string | null
          decline_reason?: string | null
          discounted_cost?: number | null
          email?: string
          first_name?: string
          hubspot_form_id?: string | null
          id?: string
          last_name?: string
          liberatoria_confirmed_at?: string | null
          liberatoria_confirmed_by?: string | null
          liberatoria_signed?: boolean | null
          panoramica_url?: string | null
          patient_story?: string
          pdc_cost?: number | null
          pdc_number?: string
          primoup_link?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_liberatoria_confirmed_by_fkey"
            columns: ["liberatoria_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "scientific_director" | "values_reviewer" | "project_manager"
      approval_status:
        | "pending"
        | "approved"
        | "declined"
        | "modification_requested"
      patient_status:
        | "pending"
        | "on_hold"
        | "approved"
        | "treatment_started"
        | "completed"
        | "declined"
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
      app_role: ["scientific_director", "values_reviewer", "project_manager"],
      approval_status: [
        "pending",
        "approved",
        "declined",
        "modification_requested",
      ],
      patient_status: [
        "pending",
        "on_hold",
        "approved",
        "treatment_started",
        "completed",
        "declined",
      ],
    },
  },
} as const
