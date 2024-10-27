import webpush, { PushSubscription } from "web-push";
import {
  IPushNotificationService,
  PushSubscriptionData,
  Result,
} from "@/models/notification/IPushNotificationService";
import { IDatabase } from "@/models/database/IDatabase";
import { ENV } from "@/config/environment";
import { logger } from "@/utils/logger";
import { PUSH_NOTIFICATION } from "@/constants/pushNotification";
import { PushNotificationError } from "@/models/errors/PushNotificationError";

export class PushNotificationService implements IPushNotificationService {
  private static instance: PushNotificationService;
  private database: IDatabase;

  private constructor(database: IDatabase) {
    this.database = database;
    webpush.setVapidDetails(
      "mailto:wjddlr905@gmail.com",
      ENV.VAPID_PUBLIC_KEY,
      ENV.VAPID_PRIVATE_KEY
    );
  }

  public static getInstance(database: IDatabase): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService(database);
    }
    return PushNotificationService.instance;
  }

  async subscribeUser(
    email: string,
    subscriptionData: PushSubscriptionData
  ): Promise<Result> {
    const subscription: PushSubscription = {
      endpoint: subscriptionData.endpoint,
      keys: {
        p256dh: Buffer.from(subscriptionData.keys.p256dh).toString("base64"),
        auth: Buffer.from(subscriptionData.keys.auth).toString("base64"),
      },
    };

    try {
      const { data: userData, error: userError } = await this.database
        .getClient()
        .from("users")
        .upsert({ email }, { onConflict: "email" })
        .select()
        .single();

      if (userError)
        throw new PushNotificationError(
          "사용자 정보 저장 실패",
          "USER_SAVE_ERROR"
        );

      const { error: subscriptionError } = await this.database
        .getClient()
        .from("push_subscriptions")
        .insert({
          user_id: userData.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        });

      if (subscriptionError)
        throw new PushNotificationError(
          "구독 정보 저장 실패",
          "SUBSCRIPTION_SAVE_ERROR"
        );

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: PUSH_NOTIFICATION.SUBSCRIPTION_SUCCESS_TITLE,
          body: PUSH_NOTIFICATION.SUBSCRIPTION_SUCCESS_BODY,
        })
      );
      return { success: true };
    } catch (error) {
      logger.error("구독 저장 또는 알림 전송 실패:", error);
      return {
        success: false,
        error:
          error instanceof PushNotificationError
            ? error.message
            : "구독 처리 중 오류 발생",
      };
    }
  }

  async unsubscribeUser(email: string, endpoint: string): Promise<Result> {
    try {
      const { data: userData, error: userError } = await this.database
        .getClient()
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError) throw userError;

      const { error } = await this.database
        .getClient()
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userData.id)
        .eq("endpoint", endpoint);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("구독 취소 중 오류 발생:", error);
      return { success: false, error: "구독 취소 실패" };
    }
  }

  async sendNotification(email: string, message: string): Promise<Result> {
    try {
      const { data: userData, error: userError } = await this.database
        .getClient()
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError)
        throw new PushNotificationError(
          "사용자 정보 조회 실패",
          "USER_FETCH_ERROR"
        );

      const { data: subscriptions, error: subscriptionError } =
        await this.database
          .getClient()
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", userData.id);

      if (subscriptionError)
        throw new PushNotificationError(
          "구독 정보 조회 실패",
          "SUBSCRIPTION_FETCH_ERROR"
        );

      for (const sub of subscriptions) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: PUSH_NOTIFICATION.TESLA_NOTIFICATION_TITLE,
            body: message,
            icon: "/icon.png",
          })
        );
      }

      return { success: true };
    } catch (error) {
      logger.error("푸시 알림 전송 오류:", error);
      return {
        success: false,
        error:
          error instanceof PushNotificationError
            ? error.message
            : "알림 전송 실패",
      };
    }
  }

  async updateTeslaTokens(
    email: string,
    accessToken: string,
    refreshToken: string
  ): Promise<Result> {
    try {
      const { error } = await this.database
        .getClient()
        .from("users")
        .update({
          tesla_access_token: accessToken,
          tesla_refresh_token: refreshToken,
        })
        .eq("email", email);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Tesla 토큰 업데이트 실패:", error);
      return { success: false, error: "Tesla 토큰 업데이트 실패" };
    }
  }
}
