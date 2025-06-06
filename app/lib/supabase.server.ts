import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const createClient = () => {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}; 