// সার্ভিস ওয়ার্কার — push notification receive করে
self.addEventListener("push", (event) => {
  let data = { title: "Manush Tech", body: "New notification" };
  try {
    data = event.data.json();
  } catch {
    // fallback
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Manush Tech", {
      body: data.body || "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: data.url || "/",
    })
  );
});

// notification click — ওই পেজে নিয়ে যাবে
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
