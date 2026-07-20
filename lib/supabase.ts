import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let browserSupabaseClient: SupabaseClient | null = null;

export const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set.");
  }
  if (browserSupabaseClient) {
    return browserSupabaseClient;
  }
  browserSupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserSupabaseClient;
};
