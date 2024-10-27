"use server";

import { PushSubscriptionData } from "@/models/notification/IPushNotificationService";
import { PushNotificationService } from "@/services/PushNotificationService";
import { SupabaseDatabase } from "@/services/SupabaseDatabase";
import { ENV } from "@/config/environment";

const database = new SupabaseDatabase(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
const pushNotificationService = PushNotificationService.getInstance(database);

export async function subscribeUser(
  email: string,
  subscriptionData: PushSubscriptionData
) {
  return pushNotificationService.subscribeUser(email, subscriptionData);
}

export async function unsubscribeUser(email: string, endpoint: string) {
  return pushNotificationService.unsubscribeUser(email, endpoint);
}

export async function sendNotification(email: string, message: string) {
  return pushNotificationService.sendNotification(email, message);
}

export async function updateTeslaTokens(
  email: string,
  accessToken: string,
  refreshToken: string
) {
  return pushNotificationService.updateTeslaTokens(
    email,
    accessToken,
    refreshToken
  );
}
