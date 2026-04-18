// Generated type surface for the lucid Supabase schema.
// Matches supabase/migrations/20260418_init.sql one-to-one.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      creators: {
        Row: {
          id: string;
          handle: string;
          display_name: string | null;
          followers: string | null;
          avg_score: number | null;
          last_scraped: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          handle: string;
          display_name?: string | null;
          followers?: string | null;
          avg_score?: number | null;
          last_scraped?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["creators"]["Insert"]>;
      };
      reels: {
        Row: {
          id: string;
          creator_id: string;
          external_id: string | null;
          post_url: string | null;
          caption: string | null;
          thumbnail_url: string | null;
          views: string | null;
          hook_type: string | null;
          duration_sec: number | null;
          score_estimate: number | null;
          scored_at: string | null;
          neuro_scores: Json | null;
          scenes: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reels"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["reels"]["Insert"]>;
      };
      patterns: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          body: string;
          rank: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["patterns"]["Row"],
          "id" | "created_at" | "rank"
        > & { id?: string; rank?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["patterns"]["Insert"]>;
      };
      scores: {
        Row: {
          id: string;
          source_url: string | null;
          source_kind: "instagram_url" | "upload" | "demo";
          duration_ms: number | null;
          overall: number;
          reward: number;
          emotion: number;
          attention: number;
          memory: number;
          verdict: string | null;
          scenes: Json | null;
          weaknesses: Json | null;
          top_moment: Json | null;
          bottom_moment: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scores"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["scores"]["Insert"]>;
      };
      rewrites: {
        Row: {
          id: string;
          score_id: string | null;
          draft: string;
          reference: string | null;
          target_duration_sec: number;
          predicted_score: number;
          predicted_lift: number;
          summary: string | null;
          shots: Json;
          research_context: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["rewrites"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["rewrites"]["Insert"]>;
      };
      rewrite_turns: {
        Row: {
          id: string;
          rewrite_id: string;
          role: "user" | "gamma";
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["rewrite_turns"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["rewrite_turns"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
