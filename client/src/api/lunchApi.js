// ======================================================================
// নকল (mock) API। NestJS backend তৈরি হলে শুধু এই ফাইলের ভেতরটা বদলাবে,
// পেজ বা component বদলাতে হবে না।
//   getWeek()          -> GET    /api/lunch/week
//   checkin()          -> POST   /api/lunch/checkin
//   cancelCheckin()    -> DELETE /api/lunch/checkin/:menuId
// ======================================================================
import { weekDates, dayNameOf, cutoffMs } from "../utils/dhaka";

const MENUS = [
  [
    { name: "Chicken Biryani", description: "Basmati rice, roasted chicken, boiled egg" },
    { name: "Beef Tehari", description: "Spiced rice with tender beef" },
  ],
  [
    { name: "Rice with Fish Curry", description: "Rui fish curry, dal, vegetables" },
    { name: "Vegetable Khichuri", description: "Lentils and rice, fried eggplant" },
  ],
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

const NO_MENU_INDEX = 1; // নমুনা: এই দিনে মেনু দেওয়া হয়নি
const KEY = "mt_demo_checkins";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function save(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

const buildDays = () => {
  const saved = readSaved();
  return weekDates().map((date, i) => {
    const closesAt = cutoffMs(date);
    if (i === NO_MENU_INDEX) {
      return { menuId: null, date, dayName: dayNameOf(date), dishes: [], myDishId: null, closesAt };
    }
    const menuId = `m-${date}`;
    const dishes = MENUS[i].map((d, n) => ({ id: `d-${date}-${n}`, ...d }));
    // নমুনা: রবিবারে আগে থেকেই একটা dish বাছাই করা
    const myDishId = saved[menuId] ?? (i === 0 ? dishes[0].id : null);
    return { menuId, date, dayName: dayNameOf(date), dishes, myDishId, closesAt };
  });
};

export async function getWeek() {
  await delay(500);
  return { serverTime: Date.now(), days: buildDays() };
}

export async function checkin(menuId, dishId) {
  await delay(500);
  const day = buildDays().find((d) => d.menuId === menuId);
  if (!day) throw new Error("Menu not found");
  if (Date.now() >= day.closesAt) throw new Error("Check-in is closed for this day");
  const saved = readSaved();
  saved[menuId] = dishId;
  save(saved);
}

export async function cancelCheckin(menuId) {
  await delay(400);
  const day = buildDays().find((d) => d.menuId === menuId);
  if (!day) throw new Error("Menu not found");
  if (Date.now() >= day.closesAt) throw new Error("Check-in is closed for this day");
  const saved = readSaved();
  saved[menuId] = null;
  save(saved);
}
