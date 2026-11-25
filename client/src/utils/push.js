// ======================================================================
// Push notification helpers.
// Fetches the VAPID public key from the API, then subscribes or unsubscribes.
// The subscription survives logout, which is what the spec asks for.
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

// A browser PushSubscription carries extra fields; the API accepts only these
function toPayload(sub) {
  const { endpoint, keys } = sub.toJSON();
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

// Whether this browser supports push
export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// Current permission state
export function getPermission() {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

// Register the service worker
async function getSW() {
  return navigator.serviceWorker.register("/sw.js");
}

// The current subscription, if there is one
export async function getSubscription() {
  try {
    // Register the worker first, then wait for it to be ready
    await navigator.serviceWorker.register("/sw.js");
    // Wait for ready, but no longer than 3 seconds
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return await ready.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// Asks for permission, creates the subscription, and saves it to the API
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

// Removes the subscription from the API as well as the browser
export async function unsubscribe() {
  const sub = await getSubscription();
  if (!sub) return;
  // Tell the API first, or the endpoint is lost before it can be deleted
  try {
    await removeSubscription(sub.endpoint);
  } catch {
    // Drop it from the browser even when the API does not have it
  }
  await sub.unsubscribe();
}

// Test notification, raised by the browser without involving the server
export async function sendTestNotification() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Manush Tech", {
    body: "Push notifications are working!",
    icon: "/favicon.svg",
  });
}
