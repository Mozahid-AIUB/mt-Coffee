// ======================================================================
// পুশ নোটিফিকেশন ইউটিলিটি।
// ব্যাকএন্ড থেকে VAPID public key নিয়ে subscribe/unsubscribe করে।
// লগআউট করলেও subscription থাকবে (spec মতে)।
// ======================================================================

import { getPublicKey, saveSubscription, removeSubscription } from "../api/pushApi";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// browser-এর PushSubscription-এ বাড়তি field থাকে, backend শুধু এই দুটো নেয়
function toPayload(sub) {
  const { endpoint, keys } = sub.toJSON();
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
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

// subscribe — permission চাইবে + subscription তৈরি করে ব্যাকএন্ডে পাঠাবে
export async function subscribe() {
  await getSW();
  const reg = await navigator.serviceWorker.ready;
  const publicKey = await getPublicKey();
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await saveSubscription(toPayload(sub));
  return sub;
}

// unsubscribe — ব্যাকএন্ড থেকেও মুছে দেয়
export async function unsubscribe() {
  const sub = await getSubscription();
  if (!sub) return;
  // আগে ব্যাকএন্ডে জানাই, নাহলে endpoint হারিয়ে যাবে
  try {
    await removeSubscription(sub.endpoint);
  } catch {
    // ব্যাকএন্ডে না থাকলেও ব্রাউজার থেকে সরিয়ে দিই
  }
  await sub.unsubscribe();
}

// টেস্ট notification — ব্রাউজারেই দেখায়, সার্ভার ছাড়া
export async function sendTestNotification() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Manush Tech", {
    body: "Push notifications are working!",
    icon: "/favicon.svg",
  });
}
