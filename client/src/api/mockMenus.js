// লাঞ্চ মেনু আর চেক-ইনের shared mock store।
// Employee Lunch page আর Admin Lunch page দুটোই এখান থেকে পড়ে।
import { weekDates, dayNameOf } from "../utils/dhaka";

const MENU_KEY = "mt_demo_menus";
const CHECKIN_KEY = "mt_demo_checkins";

// প্রথমবার seed data
const SEED_MENUS = (() => {
  const dates = weekDates();
  const dishes = [
    [
      { name: "Chicken Biryani", description: "Basmati rice, roasted chicken, boiled egg" },
      { name: "Beef Tehari", description: "Spiced rice with tender beef" },
    ],
    null, // এই দিনে মেনু নেই
    [
      { name: "Chicken Roast with Polao", description: "Polao, chicken roast, salad" },
      { name: "Beef Curry with Rice", description: "Beef bhuna, dal, mixed vegetables" },
      { name: "Egg Curry with Rice", description: "Egg curry, dal, vegetables" },
    ],
    [
      { name: "Mutton Kacchi", description: "Kacchi biryani, borhani" },
      { name: "Chicken Kacchi", description: "Kacchi biryani, borhani" },
    ],
    [
      { name: "Rice with Chicken Curry", description: "Chicken curry, dal, vegetables" },
      { name: "Fried Rice with Chicken Chili", description: "Egg fried rice, chili chicken" },
    ],
  ];
  const menus = {};
  dates.forEach((date, i) => {
    if (!dishes[i]) return;
    menus[date] = {
      id: `m-${date}`,
      date,
      dayName: dayNameOf(date),
      dishes: dishes[i].map((d, n) => ({ id: `d-${date}-${n}`, ...d })),
      createdAt: new Date().toISOString(),
    };
  });
  return menus;
})();

export function readMenus() {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // প্রথমবার seed ডাটা দিয়ে শুরু
  saveMenus(SEED_MENUS);
  return SEED_MENUS;
}

export function saveMenus(menus) {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(menus));
  } catch { /* ignore */ }
}

export function readCheckins() {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveCheckins(map) {
  try {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}
