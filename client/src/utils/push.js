// ======================================================================
// পুশ নোটিফিকেশন ইউটিলিটি।
// VAPID public key দিয়ে subscribe/unsubscribe করে।
// লগআউট করলেও subscription থাকবে (spec মতে)।
// ======================================================================

// নকল VAPID key — ব্যাকএন্ড তৈরি হলে আসল key বসবে
const VAPID_PUBLIC_KEY =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkGs-GDq6QAKJo9fjTNz3fInNa9SChFm7GDrePxlEo";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// ব্রাউজার push সাপোর্ট করে কিনা
export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// বর্তমান permission state
export function getPermission() {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

// service worker register করি
async function getSW() {
  return navigator.serviceWorker.register("/sw.js");
}

// বর্তমান subscription আছে কিনা
export async function getSubscription() {
  try {
    // আগে sw register করি, তারপর ready wait করি
    await navigator.serviceWorker.register("/sw.js");
    // ready হওয়ার জন্য wait — কিন্তু ৩ সেকেন্ডের বেশি না
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return await ready.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// subscribe — permission চাইবে + subscription তৈরি করবে
export async function subscribe() {
  await getSW();
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  // ব্যাকএন্ড তৈরি হলে এখানে sub পাঠাবো
  // await fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub), headers: {"Content-Type":"application/json"} });
  return sub;
}

// unsubscribe
export async function unsubscribe() {
  const sub = await getSubscription();
  if (sub) {
    await sub.unsubscribe();
    // ব্যাকএন্ড তৈরি হলে এখানে delete করবো
    // await fetch("/api/push/unsubscribe", { method: "POST", body: JSON.stringify(sub), headers: {"Content-Type":"application/json"} });
  }
}

// টেস্ট notification পাঠাই (mock — সত্যিকার push server ছাড়া)
export async function sendTestNotification() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Manush Tech", {
    body: "Push notifications are working!",
    icon: "/favicon.svg",
  });
}
