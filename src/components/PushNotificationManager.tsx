import urlBase64ToUint8Array from "@/utils/urlBase64ToUint8Array";
import { useEffect, useState } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("서비스 워커 등록 실패:", error);
      setError("서비스 워커 등록에 실패했습니다.");
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const subscriptionData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: Array.from(new Uint8Array(sub.getKey("p256dh") ?? [])),
          auth: Array.from(new Uint8Array(sub.getKey("auth") ?? [])),
        },
      };

      setSubscription(sub);
      const result = await subscribeUser(email, subscriptionData);
      if (result.success) {
        console.log("구독 성공");
      } else {
        console.error("구독 실패:", result.error);
        setError(result.error || "구독에 실패했습니다.");
      }
    } catch (error) {
      console.error("구독 중 오류 발생:", error);
      setError("구독 중 오류가 발생했습니다.");
    }
  }

  async function unsubscribeFromPush() {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        const result = await unsubscribeUser(email, subscription.endpoint);
        if (result.success) {
          console.log("구독 취소 성공");
          setSubscription(null);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("구독 취소 중 오류 발생:", error);
        setError("구독 취소 중 오류가 발생했습니다.");
      }
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      const result = await sendNotification(email, message);
      if (result.success) {
        console.log("알림 전송 성공");
        setMessage("");
      } else {
        console.error("알림 전송 실패:", result.error);
        setError(result.error || "알림 전송에 실패했습니다.");
      }
    }
  }

  if (!isSupported) {
    return <p>이 브라우저에서는 푸시 알림이 지원되지 않습니다.</p>;
  }

  return (
    <div>
      <h3>푸시 알림</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="email"
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {subscription ? (
        <>
          <p>푸시 알림 구독 중입니다.</p>
          <button onClick={unsubscribeFromPush}>구독 취소</button>
          <input
            type="text"
            placeholder="알림 메시지 입력"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>테스트 알림 보내기</button>
        </>
      ) : (
        <>
          <p>푸시 알림을 구독하지 않았습니다.</p>
          <button onClick={subscribeToPush}>구독하기</button>
        </>
      )}
    </div>
  );
}

export default PushNotificationManager;
