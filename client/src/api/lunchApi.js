// ======================================================================
// নকল (mock) API। NestJS backend তৈরি হলে শুধু এই ফাইলের ভেতরটা বদলাবে,
// পেজ বা component বদলাতে হবে না।
//   getWeek()          -> GET    /api/lunch/week
//   checkin()          -> POST   /api/lunch/checkin
//   cancelCheckin()    -> DELETE /api/lunch/checkin/:menuId
// ======================================================================
import { weekDates, dayNameOf, cutoffMs } from "../utils/dhaka";
import { readMenus, readCheckins, saveCheckins } from "./mockMenus";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const buildDays = () => {
  const menus = readMenus();
  const saved = readCheckins();
  return weekDates().map((date) => {
    const closesAt = cutoffMs(date);
    const menu = menus[date];
    if (!menu) {
      return { menuId: null, date, dayName: dayNameOf(date), dishes: [], myDishId: null, closesAt };
    }
    const myDishId = saved[menu.id] ?? null;
    return { menuId: menu.id, date, dayName: dayNameOf(date), dishes: menu.dishes, myDishId, closesAt };
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
  const saved = readCheckins();
  saved[menuId] = dishId;
  saveCheckins(saved);
}

export async function cancelCheckin(menuId) {
  await delay(400);
  const day = buildDays().find((d) => d.menuId === menuId);
  if (!day) throw new Error("Menu not found");
  if (Date.now() >= day.closesAt) throw new Error("Check-in is closed for this day");
  const saved = readCheckins();
  saved[menuId] = null;
  saveCheckins(saved);
}
