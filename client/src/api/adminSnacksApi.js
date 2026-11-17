// ======================================================================
// নকল (mock) API — Admin Snack Orders।
//   getAdminOrders()    -> GET   /api/admin/snacks/orders?status=&date=
//   updateOrderStatus() -> PATCH /api/admin/snacks/orders/:id/status
// ======================================================================
import { readOrders, saveOrders } from "./mockSnacks";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getAdminOrders({ status, date } = {}) {
  await delay(300);
  let orders = readOrders();

  // নকল employee info যোগ করি
  orders = orders.map((o) => ({
    ...o,
    employee: {
      fullName: "Mozahid Islam",
      employeeId: "MT-001",
    },
  }));

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }
  if (date) {
    orders = orders.filter((o) => o.createdAt.slice(0, 10) === date);
  }
  return orders;
}

export async function updateOrderStatus(orderId, status) {
  await delay(400);
  const all = readOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  order.status = status;
  saveOrders(all);
  return order;
}
