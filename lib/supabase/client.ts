import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

/**
 * Get a shared Supabase client, or null if env vars are unset.
 * The Database generic is intentionally omitted here. Each repository function
 * casts to its own typed shape so we keep strict types at the call sites
 * without fighting the SDK's wide overloads.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  if (!URL || !ANON) return null;
  _client = createClient(URL, ANON, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });
  return _client;
}

export function hasSupabase(): boolean {
  return !!URL && !!ANON;
}
