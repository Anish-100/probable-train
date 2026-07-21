// Row shapes mirrored from the Supabase schema (supabase/migrations).
// Kept hand-written for now; can be replaced with `supabase gen types`
// output later once the schema settles.

export type Building = {
  id: number;
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};
