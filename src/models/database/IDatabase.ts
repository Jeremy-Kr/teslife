import { SupabaseClient } from "@supabase/supabase-js";

export interface IDatabase {
  getClient(): SupabaseClient;

  // getUserByEmail(email: string): Promise<User | null>;
  // createUser(user: User): Promise<void>;
  // updateUser(user: User): Promise<void>;
  // deleteUser(userId: string): Promise<void>;
  // getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  // addPushSubscription(subscription: PushSubscription): Promise<void>;
  // removePushSubscription(userId: string, endpoint: string): Promise<void>;
}
