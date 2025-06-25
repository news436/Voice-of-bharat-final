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
      analytics: {
        Row: {
          article_id: string | null
          created_at: string
          event_type: string
          id: string
          referrer: string | null
          user_agent: string | null
          user_ip: unknown | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string
          featured_image_url: string | null
          id: string
          is_breaking: boolean
          is_featured: boolean
          is_live: boolean
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          state_id: string | null
          status: Database["public"]["Enums"]["article_status"]
          summary: string | null
          title: string
          updated_at: string
          youtube_video_url: string | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_breaking?: boolean
          is_featured?: boolean
          is_live?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          state_id?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          summary?: string | null
          title: string
          updated_at?: string
          youtube_video_url?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_breaking?: boolean
          is_featured?: boolean
          is_live?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          state_id?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          youtube_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_hi: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_hi?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_hi?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          stream_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          stream_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          stream_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          subscribed_categories: string[] | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_categories?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_categories?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      states: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          author_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          state_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_type: string
          video_url: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          state_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_type: string
          video_url: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          state_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_type?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      },
      ads: {
        Row: {
          id: string;
          slot_number: number;
          html_code: string | null;
          enabled: boolean;
          image_url: string | null;
          redirect_url: string | null;
          ad_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_number: number;
          html_code?: string | null;
          enabled?: boolean;
          image_url?: string | null;
          redirect_url?: string | null;
          ad_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_number?: number;
          html_code?: string | null;
          enabled?: boolean;
          image_url?: string | null;
          redirect_url?: string | null;
          ad_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
      about_us: {
        Row: {
          id: string;
          short_description: string | null;
          detailed_content: string | null;
          hero_image_url: string | null;
          team_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_description?: string | null;
          detailed_content?: string | null;
          hero_image_url?: string | null;
          team_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          short_description?: string | null;
          detailed_content?: string | null;
          hero_image_url?: string | null;
          team_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
      about_us_team_members: {
        Row: {
          id: string;
          name: string;
          name_hi: string | null;
          role: string;
          role_hi: string | null;
          image_url: string | null;
          ordering: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_hi?: string | null;
          role: string;
          role_hi?: string | null;
          image_url?: string | null;
          ordering: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_hi?: string | null;
          role?: string;
          role_hi?: string | null;
          image_url?: string | null;
          ordering?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
      support_details: {
        Row: {
          id: number;
          description: string;
          description_hi: string;
          account_holder_name: string;
          account_holder_name_hi: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          qr_code_image_url: string;
          upi_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          description: string;
          description_hi: string;
          account_holder_name: string;
          account_holder_name_hi: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          qr_code_image_url: string;
          upi_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          description?: string;
          description_hi?: string;
          account_holder_name?: string;
          account_holder_name_hi?: string;
          account_number?: string;
          ifsc_code?: string;
          bank_name?: string;
          qr_code_image_url?: string;
          upi_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
      socials: {
        Row: {
          id: string;
          facebook_url: string;
          twitter_url: string;
          youtube_url: string;
          instagram_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          facebook_url: string;
          twitter_url: string;
          youtube_url: string;
          instagram_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          facebook_url?: string;
          twitter_url?: string;
          youtube_url?: string;
          instagram_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      article_status: "draft" | "published" | "archived"
      user_role: "admin" | "editor" | "author"
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
    Enums: {
      article_status: ["draft", "published", "archived"],
      user_role: ["admin", "editor", "author"],
    },
  },
} as const

// Custom types for convenience
export type SupabaseArticle = Database["public"]["Tables"]["articles"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  states: Database["public"]["Tables"]["states"]["Row"] | null;
};

export type SupabaseCategory = Database["public"]["Tables"]["categories"]["Row"];
export type SupabaseVideo = Database["public"]["Tables"]["videos"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  states: Database["public"]["Tables"]["states"]["Row"] | null;
};
