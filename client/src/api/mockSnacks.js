// Mock snack items and orders, kept in localStorage.
// The admin snacks page reads from this same store.

export const SNACK_ITEMS = [
  {
    id: "tea",
    name: "Tea",
    isAvailable: true,
    options: [
      { key: "sugar", label: "Sugar", choices: ["None", "Less", "Normal"], default: "Normal" },
      { key: "type", label: "Type", choices: ["Milk Tea", "Black Tea", "Green Tea"], default: "Milk Tea" },
    ],
  },
  {
    id: "coffee",
    name: "Coffee",
    isAvailable: true,
    options: [
      { key: "sugar", label: "Sugar", choices: ["None", "Less", "Normal"], default: "Normal" },
      { key: "type", label: "Type", choices: ["Milk Coffee", "Black Coffee"], default: "Milk Coffee" },
    ],
  },
];

const KEY = "mt_demo_snack_orders";

export function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveOrders(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
