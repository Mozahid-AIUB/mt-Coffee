import api from "./axios";

export async function getItems() {
  const res = await api.get("/snacks/items");
  return res.data.data;
}

export async function placeOrder(data) {
  const res = await api.post("/snacks/orders", data);
  return res.data;
}

export async function getMyOrders() {
  const res = await api.get("/snacks/orders/mine");
  return res.data.data;
}

export async function cancelOrder(orderId) {
  const res = await api.patch(`/snacks/orders/${orderId}/cancel`);
  return res.data;
}
