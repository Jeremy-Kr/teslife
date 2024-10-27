import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { IDatabase } from "@/models/database/IDatabase";

export class SupabaseDatabase implements IDatabase {
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
