import { createClient } from "@supabase/supabase-js";

// Public, read-only client using the publishable key. Safe to use on both
// server and client since RLS on every table restricts access to SELECT.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy web/.env.example to web/.env.local and fill in from `supabase status`.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
