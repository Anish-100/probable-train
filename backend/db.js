// Creates the Supabase client the rest of the backend uses to query Postgres.
//
// `@supabase/supabase-js` wraps the database in a JavaScript API, so instead of
// writing raw SQL strings we call methods like `.from('buildings').select()`.
// (Under the hood it talks to Supabase's auto-generated REST API over HTTP.)

import { createClient } from '@supabase/supabase-js'

// process.env holds environment variables. These were loaded from the .env
// file by Node's --env-file flag (see package.json), NOT hardcoded here.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Fail loudly at startup if the config is missing, rather than getting a
// confusing error deep inside a request later.
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY — check backend/.env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
