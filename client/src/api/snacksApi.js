// ======================================================================
// নকল (mock) API — স্ন্যাকস। backend তৈরি হলে শুধু ভেতরটা বদলাবে।
//   getItems()         -> GET    /api/snacks/items
//   placeOrder()       -> POST   /api/snacks/orders
//   getMyOrders()      -> GET    /api/snacks/orders/mine
//   cancelOrder()      -> PATCH  /api/snacks/orders/:id/cancel
// ======================================================================
import { SNACK_ITEMS, readOrders, saveOrders } from "./mockSnacks";
import { snackServiceOpen } from "../utils/dhaka";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let nextId = Date.now();

export async function getItems() {
  await delay(300);
  return SNACK_ITEMS.filter((i) => i.isAvailable);
}

export async function placeOrder({ itemId, quantity, options, location, note }) {
  await delay(500);
  if (!snackServiceOpen()) throw new Error("Snacks service is available from 8:00 AM to 8:00 PM");

  const item = SNACK_ITEMS.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  const order = {
    id: `so-${++nextId}`,
    itemId,
    itemName: item.name,
    quantity,
    options,
    location,
    note: note || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const all = readOrders();
  all.unshift(order);
  saveOrders(all);
  return order;
}

export async function getMyOrders() {
  await delay(300);
  // নকল হিসেবে সব order-ই "my" orders
  const today = new Date().toISOString().slice(0, 10);
  return readOrders().filter((o) => o.createdAt.slice(0, 10) === today);
}

export async function cancelOrder(orderId) {
  await delay(400);
  const all = readOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") throw new Error("Only pending orders can be cancelled");
  order.status = "cancelled";
  saveOrders(all);
  return order;
}
