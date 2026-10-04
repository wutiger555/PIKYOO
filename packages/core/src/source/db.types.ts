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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      coach_pay_details: {
        Row: {
          coach_id: string
          details: Json
          updated_at: string
        }
        Insert: {
          coach_id: string
          details?: Json
          updated_at?: string
        }
        Update: {
          coach_id?: string
          details?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_pay_details_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_pay_details_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_plans: {
        Row: {
          archived_at: string | null
          capacity: number
          coach_id: string
          duration_min: number
          group_max: number | null
          group_min: number | null
          id: string
          key: string
          kind: Database["public"]["Enums"]["lesson_kind"]
          name: string
          note: string
          price: number
          size_label: string
          sort: number
          tag: string | null
          unit: Database["public"]["Enums"]["plan_unit"]
        }
        Insert: {
          archived_at?: string | null
          capacity?: number
          coach_id: string
          duration_min: number
          group_max?: number | null
          group_min?: number | null
          id?: string
          key: string
          kind: Database["public"]["Enums"]["lesson_kind"]
          name: string
          note?: string
          price: number
          size_label?: string
          sort?: number
          tag?: string | null
          unit: Database["public"]["Enums"]["plan_unit"]
        }
        Update: {
          archived_at?: string | null
          capacity?: number
          coach_id?: string
          duration_min?: number
          group_max?: number | null
          group_min?: number | null
          id?: string
          key?: string
          kind?: Database["public"]["Enums"]["lesson_kind"]
          name?: string
          note?: string
          price?: number
          size_label?: string
          sort?: number
          tag?: string | null
          unit?: Database["public"]["Enums"]["plan_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "coach_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          approved_at: string | null
          areas: string[]
          audience: string[]
          availability: Json
          beginner_friendly: boolean
          bio: string
          coaching_since: number | null
          created_at: string
          id: string
          languages: string[]
          level_max: number
          level_min: number
          name: string
          pay_methods: Database["public"]["Enums"]["pay_method"][]
          photos: Json
          play: Json
          policy: string
          profile_id: string
          quotes: Json
          reply_note: string
          slug: string
          status: Database["public"]["Enums"]["coach_status"]
          steps: string[]
          style: string[]
          tagline: string
          timeline: Json
          updated_at: string
          venues: Json
        }
        Insert: {
          approved_at?: string | null
          areas?: string[]
          audience?: string[]
          availability?: Json
          beginner_friendly?: boolean
          bio?: string
          coaching_since?: number | null
          created_at?: string
          id?: string
          languages?: string[]
          level_max?: number
          level_min?: number
          name: string
          pay_methods?: Database["public"]["Enums"]["pay_method"][]
          photos?: Json
          play?: Json
          policy?: string
          profile_id: string
          quotes?: Json
          reply_note?: string
          slug: string
          status?: Database["public"]["Enums"]["coach_status"]
          steps?: string[]
          style?: string[]
          tagline?: string
          timeline?: Json
          updated_at?: string
          venues?: Json
        }
        Update: {
          approved_at?: string | null
          areas?: string[]
          audience?: string[]
          availability?: Json
          beginner_friendly?: boolean
          bio?: string
          coaching_since?: number | null
          created_at?: string
          id?: string
          languages?: string[]
          level_max?: number
          level_min?: number
          name?: string
          pay_methods?: Database["public"]["Enums"]["pay_method"][]
          photos?: Json
          play?: Json
          policy?: string
          profile_id?: string
          quotes?: Json
          reply_note?: string
          slug?: string
          status?: Database["public"]["Enums"]["coach_status"]
          steps?: string[]
          style?: string[]
          tagline?: string
          timeline?: Json
          updated_at?: string
          venues?: Json
        }
        Relationships: [
          {
            foreignKeyName: "coaches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          address: string
          amenities: string[]
          booking_method: Database["public"]["Enums"]["booking_method"]
          booking_note: string
          booking_url: string | null
          city: string
          court_count: number
          created_at: string
          district: string
          has_aircon: boolean
          has_lights: boolean
          hours_note: string
          id: string
          is_free: boolean
          kind: Database["public"]["Enums"]["court_kind"]
          lat: number | null
          lng: number | null
          name: string
          photos: Json
          price_note: string
          published: boolean
          rules: string
          slug: string
          surface: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[]
          booking_method: Database["public"]["Enums"]["booking_method"]
          booking_note?: string
          booking_url?: string | null
          city: string
          court_count: number
          created_at?: string
          district: string
          has_aircon?: boolean
          has_lights?: boolean
          hours_note?: string
          id?: string
          is_free?: boolean
          kind: Database["public"]["Enums"]["court_kind"]
          lat?: number | null
          lng?: number | null
          name: string
          photos?: Json
          price_note?: string
          published?: boolean
          rules?: string
          slug: string
          surface?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[]
          booking_method?: Database["public"]["Enums"]["booking_method"]
          booking_note?: string
          booking_url?: string | null
          city?: string
          court_count?: number
          created_at?: string
          district?: string
          has_aircon?: boolean
          has_lights?: boolean
          hours_note?: string
          id?: string
          is_free?: boolean
          kind?: Database["public"]["Enums"]["court_kind"]
          lat?: number | null
          lng?: number | null
          name?: string
          photos?: Json
          price_note?: string
          published?: boolean
          rules?: string
          slug?: string
          surface?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      credentials: {
        Row: {
          coach_id: string
          created_at: string
          document_path: string | null
          id: string
          identifier: string | null
          issuer: string
          level: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verify_status"]
          type: Database["public"]["Enums"]["credential_type"]
        }
        Insert: {
          coach_id: string
          created_at?: string
          document_path?: string | null
          id?: string
          identifier?: string | null
          issuer: string
          level?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verify_status"]
          type: Database["public"]["Enums"]["credential_type"]
        }
        Update: {
          coach_id?: string
          created_at?: string
          document_path?: string | null
          id?: string
          identifier?: string | null
          issuer?: string
          level?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verify_status"]
          type?: Database["public"]["Enums"]["credential_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credentials_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_participants: {
        Row: {
          added_by: string | null
          attendance_marked_at: string | null
          cancelled_at: string | null
          game_id: string
          guest_name: string | null
          id: string
          joined_at: string
          status: Database["public"]["Enums"]["participant_status"]
          user_id: string | null
        }
        Insert: {
          added_by?: string | null
          attendance_marked_at?: string | null
          cancelled_at?: string | null
          game_id: string
          guest_name?: string | null
          id?: string
          joined_at?: string
          status: Database["public"]["Enums"]["participant_status"]
          user_id?: string | null
        }
        Update: {
          added_by?: string | null
          attendance_marked_at?: string | null
          cancelled_at?: string | null
          game_id?: string
          guest_name?: string | null
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["participant_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          address: string
          beginner_friendly: boolean
          cancel_hours: number
          cancelled_at: string | null
          capacity: number
          court_id: string | null
          created_at: string
          district: string
          ends_at: string
          fee: number
          fee_note: string
          host_contact: string
          host_counts: boolean
          host_id: string
          id: string
          level_max: number
          level_min: number
          location_text: string
          notes: string
          source_text: string | null
          starts_at: string
          strict_level: boolean
          updated_at: string
        }
        Insert: {
          address?: string
          beginner_friendly?: boolean
          cancel_hours?: number
          cancelled_at?: string | null
          capacity: number
          court_id?: string | null
          created_at?: string
          district?: string
          ends_at: string
          fee?: number
          fee_note?: string
          host_contact?: string
          host_counts?: boolean
          host_id: string
          id?: string
          level_max: number
          level_min: number
          location_text?: string
          notes?: string
          source_text?: string | null
          starts_at: string
          strict_level?: boolean
          updated_at?: string
        }
        Update: {
          address?: string
          beginner_friendly?: boolean
          cancel_hours?: number
          cancelled_at?: string | null
          capacity?: number
          court_id?: string | null
          created_at?: string
          district?: string
          ends_at?: string
          fee?: number
          fee_note?: string
          host_contact?: string
          host_counts?: boolean
          host_id?: string
          id?: string
          level_max?: number
          level_min?: number
          location_text?: string
          notes?: string
          source_text?: string | null
          starts_at?: string
          strict_level?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_bookings: {
        Row: {
          amount: number
          cancelled_at: string | null
          coach_id: string
          created_at: string
          decided_at: string | null
          expires_at: string
          group_id: string | null
          headcount: number
          id: string
          note: string
          pay_method: Database["public"]["Enums"]["pay_method"]
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["lesson_booking_status"]
          student_id: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          coach_id: string
          created_at?: string
          decided_at?: string | null
          expires_at: string
          group_id?: string | null
          headcount?: number
          id?: string
          note?: string
          pay_method: Database["public"]["Enums"]["pay_method"]
          plan_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["lesson_booking_status"]
          student_id: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          coach_id?: string
          created_at?: string
          decided_at?: string | null
          expires_at?: string
          group_id?: string | null
          headcount?: number
          id?: string
          note?: string
          pay_method?: Database["public"]["Enums"]["pay_method"]
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["lesson_booking_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_bookings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "lesson_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_bookings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coach_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "lesson_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_groups: {
        Row: {
          coach_id: string
          created_at: string
          deadline_at: string
          id: string
          invite_code: string
          note: string
          organizer_id: string
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["lesson_group_status"]
        }
        Insert: {
          coach_id: string
          created_at?: string
          deadline_at: string
          id?: string
          invite_code?: string
          note?: string
          organizer_id: string
          plan_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["lesson_group_status"]
        }
        Update: {
          coach_id?: string
          created_at?: string
          deadline_at?: string
          id?: string
          invite_code?: string
          note?: string
          organizer_id?: string
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["lesson_group_status"]
        }
        Relationships: [
          {
            foreignKeyName: "lesson_groups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_groups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_groups_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_groups_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coach_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          error: string | null
          id: string
          kind: string
          payload: Json
          read_at: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          channel: string
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          paid_at: string | null
          payer_id: string
          ref_last5: string | null
          reported_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["pay_method"]
          paid_at?: string | null
          payer_id: string
          ref_last5?: string | null
          reported_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          paid_at?: string | null
          payer_id?: string
          ref_last5?: string | null
          reported_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "lesson_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_private: {
        Row: {
          created_at: string
          home_districts: string[]
          id: string
          is_admin: boolean
          line_user_id: string | null
          notify: Json
          onboarded_at: string | null
        }
        Insert: {
          created_at?: string
          home_districts?: string[]
          id: string
          is_admin?: boolean
          line_user_id?: string | null
          notify?: Json
          onboarded_at?: string | null
        }
        Update: {
          created_at?: string
          home_districts?: string[]
          id?: string
          is_admin?: boolean
          line_user_id?: string | null
          notify?: Json
          onboarded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_private_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          level: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id: string
          level?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          asker_id: string
          coach_id: string
          created_at: string
          hidden_at: string | null
          id: string
          text: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          asker_id: string
          coach_id: string
          created_at?: string
          hidden_at?: string | null
          id?: string
          text: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          asker_id?: string
          coach_id?: string
          created_at?: string
          hidden_at?: string | null
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_asker_id_fkey"
            columns: ["asker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coach_cards: {
        Row: {
          approved_at: string | null
          areas: string[] | null
          audience: string[] | null
          availability: Json | null
          beginner_friendly: boolean | null
          bio: string | null
          certified: boolean | null
          coaching_since: number | null
          created_at: string | null
          id: string | null
          kinds: Database["public"]["Enums"]["lesson_kind"][] | null
          languages: string[] | null
          level_max: number | null
          level_min: number | null
          name: string | null
          pay_methods: Database["public"]["Enums"]["pay_method"][] | null
          photos: Json | null
          play: Json | null
          policy: string | null
          price_from: number | null
          profile_id: string | null
          quotes: Json | null
          reply_note: string | null
          slug: string | null
          status: Database["public"]["Enums"]["coach_status"] | null
          steps: string[] | null
          students: number | null
          style: string[] | null
          tagline: string | null
          timeline: Json | null
          updated_at: string | null
          venues: Json | null
        }
        Insert: {
          approved_at?: string | null
          areas?: string[] | null
          audience?: string[] | null
          availability?: Json | null
          beginner_friendly?: boolean | null
          bio?: string | null
          certified?: never
          coaching_since?: number | null
          created_at?: string | null
          id?: string | null
          kinds?: never
          languages?: string[] | null
          level_max?: number | null
          level_min?: number | null
          name?: string | null
          pay_methods?: Database["public"]["Enums"]["pay_method"][] | null
          photos?: Json | null
          play?: Json | null
          policy?: string | null
          price_from?: never
          profile_id?: string | null
          quotes?: Json | null
          reply_note?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          steps?: string[] | null
          students?: never
          style?: string[] | null
          tagline?: string | null
          timeline?: Json | null
          updated_at?: string | null
          venues?: Json | null
        }
        Update: {
          approved_at?: string | null
          areas?: string[] | null
          audience?: string[] | null
          availability?: Json | null
          beginner_friendly?: boolean | null
          bio?: string | null
          certified?: never
          coaching_since?: number | null
          created_at?: string | null
          id?: string | null
          kinds?: never
          languages?: string[] | null
          level_max?: number | null
          level_min?: number | null
          name?: string | null
          pay_methods?: Database["public"]["Enums"]["pay_method"][] | null
          photos?: Json | null
          play?: Json | null
          policy?: string | null
          price_from?: never
          profile_id?: string | null
          quotes?: Json | null
          reply_note?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          steps?: string[] | null
          students?: never
          style?: string[] | null
          tagline?: string | null
          timeline?: Json | null
          updated_at?: string | null
          venues?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "coaches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_cards: {
        Row: {
          address: string | null
          beginner_friendly: boolean | null
          cancel_hours: number | null
          cancelled_at: string | null
          capacity: number | null
          court_count: number | null
          court_id: string | null
          court_kind: Database["public"]["Enums"]["court_kind"] | null
          court_name: string | null
          court_slug: string | null
          created_at: string | null
          district: string | null
          ends_at: string | null
          fee: number | null
          fee_note: string | null
          host_avatar_url: string | null
          host_contact: string | null
          host_counts: boolean | null
          host_game_count: number | null
          host_id: string | null
          host_name: string | null
          id: string | null
          joined_count: number | null
          level_max: number | null
          level_min: number | null
          location_text: string | null
          notes: string | null
          source_text: string | null
          starts_at: string | null
          strict_level: boolean | null
          updated_at: string | null
          waitlist_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      answer_question: {
        Args: { p_answer: string; p_question: string }
        Returns: undefined
      }
      assert_no_contact: { Args: { t: string }; Returns: undefined }
      assert_session: {
        Args: { p_plan: string; p_starts_at: string }
        Returns: {
          approved_at: string | null
          areas: string[]
          audience: string[]
          availability: Json
          beginner_friendly: boolean
          bio: string
          coaching_since: number | null
          created_at: string
          id: string
          languages: string[]
          level_max: number
          level_min: number
          name: string
          pay_methods: Database["public"]["Enums"]["pay_method"][]
          photos: Json
          play: Json
          policy: string
          profile_id: string
          quotes: Json
          reply_note: string
          slug: string
          status: Database["public"]["Enums"]["coach_status"]
          steps: string[]
          style: string[]
          tagline: string
          timeline: Json
          updated_at: string
          venues: Json
        }
        SetofOptions: {
          from: "*"
          to: "coaches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_booking: { Args: { p_booking: string }; Returns: undefined }
      cancel_game: { Args: { p_game: string }; Returns: undefined }
      coach_stats: {
        Args: never
        Returns: {
          coach_id: string
          lessons: number
          students: number
        }[]
      }
      contact_kind: { Args: { t: string }; Returns: string }
      create_lesson_group: {
        Args: { p_note: string; p_plan: string; p_starts_at: string }
        Returns: {
          coach_id: string
          created_at: string
          deadline_at: string
          id: string
          invite_code: string
          note: string
          organizer_id: string
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["lesson_group_status"]
        }
        SetofOptions: {
          from: "*"
          to: "lesson_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decide_booking: {
        Args: { p_accept: boolean; p_booking: string }
        Returns: undefined
      }
      delete_my_account: { Args: never; Returns: undefined }
      expire_stale: { Args: never; Returns: undefined }
      hide_question: {
        Args: { p_hidden: boolean; p_question: string }
        Returns: undefined
      }
      host_add_guest: {
        Args: { p_game: string; p_name: string }
        Returns: Database["public"]["Enums"]["participant_status"]
      }
      host_remove_participant: {
        Args: { p_participant: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_group_member: { Args: { p_group: string }; Returns: boolean }
      is_trusted: { Args: never; Returns: boolean }
      join_game: {
        Args: { p_game: string }
        Returns: Database["public"]["Enums"]["participant_status"]
      }
      join_lesson_group: { Args: { p_code: string }; Returns: string }
      leave_game: {
        Args: { p_game: string }
        Returns: Database["public"]["Enums"]["participant_status"]
      }
      leave_lesson_group: { Args: { p_group: string }; Returns: undefined }
      lesson_group_by_code: { Args: { p_code: string }; Returns: Json }
      lesson_seats_left: {
        Args: { p_plan: string; p_starts_at: string }
        Returns: number
      }
      mark_payment_paid: { Args: { p_payment: string }; Returns: undefined }
      my_coach_id: { Args: never; Returns: string }
      notify: {
        Args: {
          p_channel?: string
          p_kind: string
          p_payload: Json
          p_user: string
        }
        Returns: undefined
      }
      open_sessions: {
        Args: { p_coach_slug: string; p_days?: number }
        Returns: {
          plan_key: string
          seats_left: number
          starts_at: string
        }[]
      }
      payment_instructions: { Args: { p_payment: string }; Returns: Json }
      promote_waitlist: { Args: { p_game: string }; Returns: number }
      reject_payment_report: { Args: { p_payment: string }; Returns: undefined }
      report_payment: {
        Args: { p_last5: string; p_payment: string }
        Returns: undefined
      }
      request_booking: {
        Args: {
          p_headcount: number
          p_note: string
          p_pay: Database["public"]["Enums"]["pay_method"]
          p_plan: string
          p_starts_at: string
        }
        Returns: string
      }
      review_coach: {
        Args: { p_approve: boolean; p_coach: string; p_note?: string }
        Returns: undefined
      }
      review_credential: {
        Args: { p_credential: string; p_verified: boolean }
        Returns: undefined
      }
      submit_lesson_group: {
        Args: {
          p_group: string
          p_pay: Database["public"]["Enums"]["pay_method"]
        }
        Returns: string
      }
      tpe_hhmi: { Args: { ts: string }; Returns: string }
      tpe_weekday: { Args: { ts: string }; Returns: string }
    }
    Enums: {
      booking_method: "public_system" | "website" | "line" | "phone" | "walk_in"
      coach_status: "draft" | "pending" | "approved" | "suspended"
      court_kind: "indoor" | "outdoor" | "covered"
      credential_type: "coach_cert" | "dupr" | "tournament"
      lesson_booking_status:
        | "pending"
        | "confirmed"
        | "declined"
        | "expired"
        | "cancelled"
        | "attended"
        | "no_show"
      lesson_group_status:
        | "gathering"
        | "requested"
        | "confirmed"
        | "declined"
        | "expired"
        | "cancelled"
      lesson_kind: "trial" | "private" | "small" | "group"
      participant_status:
        | "joined"
        | "waitlisted"
        | "cancelled"
        | "late_cancelled"
        | "attended"
        | "no_show"
      pay_method: "line_pay" | "bank_transfer" | "cash"
      payment_status: "waiting" | "reported" | "paid" | "refunded"
      plan_unit: "per_person" | "per_lesson" | "per_pack"
      verify_status: "self_reported" | "pending" | "verified" | "rejected"
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
      booking_method: ["public_system", "website", "line", "phone", "walk_in"],
      coach_status: ["draft", "pending", "approved", "suspended"],
      court_kind: ["indoor", "outdoor", "covered"],
      credential_type: ["coach_cert", "dupr", "tournament"],
      lesson_booking_status: [
        "pending",
        "confirmed",
        "declined",
        "expired",
        "cancelled",
        "attended",
        "no_show",
      ],
      lesson_group_status: [
        "gathering",
        "requested",
        "confirmed",
        "declined",
        "expired",
        "cancelled",
      ],
      lesson_kind: ["trial", "private", "small", "group"],
      participant_status: [
        "joined",
        "waitlisted",
        "cancelled",
        "late_cancelled",
        "attended",
        "no_show",
      ],
      pay_method: ["line_pay", "bank_transfer", "cash"],
      payment_status: ["waiting", "reported", "paid", "refunded"],
      plan_unit: ["per_person", "per_lesson", "per_pack"],
      verify_status: ["self_reported", "pending", "verified", "rejected"],
    },
  },
} as const
