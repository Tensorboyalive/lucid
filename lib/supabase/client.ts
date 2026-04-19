import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

/**
 * Get a shared Supabase client, or null if env vars are unset.
 *
 * The Database generic is intentionally omitted here. The repository layer
 * uses narrow `as unknown as Json` casts on JSONB column inserts; wiring the
 * generic produced stricter overload inference that tripped every insert(),
 * and the ROI of fixing row-level types wasn't worth the churn. Revisit once
 * @supabase/supabase-js stabilizes its types in a later major.
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
