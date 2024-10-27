export interface IPushNotificationService {
  subscribeUser(
    email: string,
    subscriptionData: PushSubscriptionData
  ): Promise<Result>;
  unsubscribeUser(email: string, endpoint: string): Promise<Result>;
  sendNotification(email: string, message: string): Promise<Result>;
  updateTeslaTokens(
    email: string,
    accessToken: string,
    refreshToken: string
  ): Promise<Result>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: number[]; auth: number[] };
}

export type Result =
  | { success: true }
  | { success: false; error: string };
