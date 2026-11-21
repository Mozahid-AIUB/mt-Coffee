import api from "./axios";

export async function getItems() {
  const res = await api.get("/admin/snacks/items");
  return res.data.data;
}

export async function createItem(data) {
  const res = await api.post("/admin/snacks/items", data);
  return res.data;
}

export async function updateItem(id, data) {
  const res = await api.patch(`/admin/snacks/items/${id}`, data);
  return res.data;
}

export async function toggleAvailability(id, isAvailable) {
  const res = await api.patch(`/admin/snacks/items/${id}/availability`, { isAvailable });
  return res.data;
}

export async function getAdminOrders() {
  const res = await api.get("/admin/snacks/orders");
  return res.data.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/admin/snacks/orders/${orderId}/status`, { status });
  return res.data;
}
