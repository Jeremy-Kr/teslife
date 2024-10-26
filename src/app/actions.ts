"use server";

import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
  "mailto:wjddlr905@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(subscriptionData: {
  endpoint: string;
  keys: { p256dh: number[]; auth: number[] };
}) {
  subscription = {
    endpoint: subscriptionData.endpoint,
    keys: {
      p256dh: Buffer.from(subscriptionData.keys.p256dh).toString("base64"),
      auth: Buffer.from(subscriptionData.keys.auth).toString("base64"),
    },
  } as PushSubscription;

  if (subscription) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "구독 성공",
          body: "푸시 알림 구독이 완료되었습니다.",
        })
      );
      return { success: true };
    } catch (error) {
      console.error("구독 확인 알림 전송 실패:", error);
      return { success: false, error: "구독 확인 알림 전송 실패" };
    }
  }

  return { success: false, error: "구독 정보 생성 실패" };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    return { success: false, error: "구독 정보가 없습니다" };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "새 알림",
        body: message,
        icon: "/icon.png",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("푸시 알림 전송 오류:", error);
    return { success: false, error: "알림 전송 실패" };
  }
}
