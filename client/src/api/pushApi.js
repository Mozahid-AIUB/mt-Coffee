import api from "./axios";

export async function getPublicKey() {
  const res = await api.get("/push/public-key");
  return res.data.data.publicKey;
}

export async function saveSubscription(subscription) {
  const res = await api.post("/push/subscribe", subscription);
  return res.data;
}

export async function removeSubscription(endpoint) {
  const res = await api.delete("/push/subscribe", { data: { endpoint } });
  return res.data;
}
