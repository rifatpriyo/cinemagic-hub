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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_seats: {
        Row: {
          booking_id: string
          id: string
          seat_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          seat_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          seat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_seats_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_seats_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          discount: number | null
          final_price: number
          id: string
          promo_code: string | null
          quantity: number | null
          section_name: string | null
          show_id: string
          status: string
          total_price: number
          type: string
          user_id: string
        }
        Insert: {
          booking_date?: string | null
          discount?: number | null
          final_price: number
          id?: string
          promo_code?: string | null
          quantity?: number | null
          section_name?: string | null
          show_id: string
          status?: string
          total_price: number
          type: string
          user_id: string
        }
        Update: {
          booking_date?: string | null
          discount?: number | null
          final_price?: number
          id?: string
          promo_code?: string | null
          quantity?: number | null
          section_name?: string | null
          show_id?: string
          status?: string
          total_price?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      concert_sections: {
        Row: {
          available_capacity: number
          concert_id: string
          id: string
          name: string
          price: number
          total_capacity: number
        }
        Insert: {
          available_capacity: number
          concert_id: string
          id?: string
          name: string
          price: number
          total_capacity: number
        }
        Update: {
          available_capacity?: number
          concert_id?: string
          id?: string
          name?: string
          price?: number
          total_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "concert_sections_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts: {
        Row: {
          artist: string
          backdrop: string | null
          created_at: string | null
          date: string
          description: string
          genre: string
          id: string
          poster: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          artist: string
          backdrop?: string | null
          created_at?: string | null
          date: string
          description: string
          genre: string
          id?: string
          poster: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string
          backdrop?: string | null
          created_at?: string | null
          date?: string
          description?: string
          genre?: string
          id?: string
          poster?: string
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      halls: {
        Row: {
          id: string
          name: string
          rows: number
          seats_per_row: number
          total_seats: number
          type: string
        }
        Insert: {
          id?: string
          name: string
          rows: number
          seats_per_row: number
          total_seats: number
          type: string
        }
        Update: {
          id?: string
          name?: string
          rows?: number
          seats_per_row?: number
          total_seats?: number
          type?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          backdrop: string | null
          cast_members: string[]
          created_at: string | null
          description: string
          director: string
          duration: number
          genre: string[]
          id: string
          language: string
          poster: string
          rating: number | null
          release_date: string
          title: string
          trailer_url: string | null
          updated_at: string | null
        }
        Insert: {
          backdrop?: string | null
          cast_members: string[]
          created_at?: string | null
          description: string
          director: string
          duration: number
          genre: string[]
          id?: string
          language?: string
          poster: string
          rating?: number | null
          release_date: string
          title: string
          trailer_url?: string | null
          updated_at?: string | null
        }
        Update: {
          backdrop?: string | null
          cast_members?: string[]
          created_at?: string | null
          description?: string
          director?: string
          duration?: number
          genre?: string[]
          id?: string
          language?: string
          poster?: string
          rating?: number | null
          release_date?: string
          title?: string
          trailer_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          monthly_booking_count: number | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          monthly_booking_count?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          monthly_booking_count?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          discount: number
          id: string
          is_active: boolean | null
          type: string
        }
        Insert: {
          code: string
          created_at?: string | null
          discount: number
          id?: string
          is_active?: boolean | null
          type: string
        }
        Update: {
          code?: string
          created_at?: string | null
          discount?: number
          id?: string
          is_active?: boolean | null
          type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          movie_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          movie_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          movie_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          id: string
          row_letter: string
          seat_number: number
          showtime_id: string
          status: string
          type: string
        }
        Insert: {
          id?: string
          row_letter: string
          seat_number: number
          showtime_id: string
          status?: string
          type: string
        }
        Update: {
          id?: string
          row_letter?: string
          seat_number?: number
          showtime_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      showtimes: {
        Row: {
          created_at: string | null
          date: string
          hall_id: string
          id: string
          movie_id: string
          price_deluxe: number
          price_normal: number
          price_super: number
          time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          hall_id: string
          id?: string
          movie_id: string
          price_deluxe: number
          price_normal: number
          price_super: number
          time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          hall_id?: string
          id?: string
          movie_id?: string
          price_deluxe?: number
          price_normal?: number
          price_super?: number
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showtimes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
