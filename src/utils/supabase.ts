import { SupabaseDatabase } from "@/services/SupabaseDatabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = new SupabaseDatabase(supabaseUrl, supabaseAnonKey);
