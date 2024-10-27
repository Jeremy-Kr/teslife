"use server";

import webpush, { PushSubscription } from "web-push";
import { supabase } from "@/utils/supabase";

webpush.setVapidDetails(
  "mailto:wjddlr905@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(
  email: string,
  subscriptionData: {
    endpoint: string;
    keys: { p256dh: number[]; auth: number[] };
  }
) {
  const subscription = {
    endpoint: subscriptionData.endpoint,
    keys: {
      p256dh: Buffer.from(subscriptionData.keys.p256dh).toString("base64"),
      auth: Buffer.from(subscriptionData.keys.auth).toString("base64"),
    },
  } as PushSubscription;

  try {
    // 사용자 정보 저장 또는 업데이트
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({ email }, { onConflict: "email" })
      .select()
      .single();

    if (userError) throw userError;

    // Supabase에 구독 정보 저장
    const { error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: userData.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });

    if (subscriptionError) throw subscriptionError;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "구독 성공",
        body: "푸시 알림 구독이 완료되었습니다.",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("구독 저장 또는 알림 전송 실패:", error);
    return { success: false, error: "구독 처리 중 오류 발생" };
  }
}

export async function unsubscribeUser(email: string, endpoint: string) {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    const { error } = await supabase
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

export async function sendNotification(email: string, message: string) {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userData.id);

    if (subscriptionError) throw subscriptionError;

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
          title: "Tesla 알림",
          body: message,
          icon: "/icon.png",
        })
      );
    }

    return { success: true };
  } catch (error) {
    console.error("푸시 알림 전송 오류:", error);
    return { success: false, error: "알림 전송 실패" };
  }
}

export async function updateTeslaTokens(
  email: string,
  accessToken: string,
  refreshToken: string
) {
  try {
    const { error } = await supabase
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
