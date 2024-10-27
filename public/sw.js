self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
      // 백그라운드에서 알림을 클릭했을 때 열릴 URL
      tag: "renotify",
      renotify: true,
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("알림 클릭됨.");
  event.notification.close();
  // 알림 클릭 시 열릴 URL을 지정합니다.
  event.waitUntil(
    clients.openWindow(
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "localhost:3000"}`
    )
  );
});

console.log("서비스 워커가 로드되었습니다.");
