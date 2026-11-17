// ======================================================================
// নকল (mock) API — Admin Lunch Menu Management।
//   getMenus()         -> GET    /api/admin/lunch/menu?from=&to=
//   createMenu()       -> POST   /api/admin/lunch/menu
//   updateMenu()       -> PUT    /api/admin/lunch/menu/:id
//   deleteMenu()       -> DELETE /api/admin/lunch/menu/:id
// ======================================================================
import { dayNameOf, cutoffMs } from "../utils/dhaka";
import { readMenus, saveMenus, readCheckins } from "./mockMenus";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let nextDishId = Date.now();

export async function getMenus(from, to) {
  await delay(400);
  const menus = readMenus();
  const checkins = readCheckins();
  return Object.values(menus)
    .filter((m) => (!from || m.date >= from) && (!to || m.date <= to))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      ...m,
      cutoffAt: cutoffMs(m.date),
      // প্রতিটা dish-এ কতজন check-in করেছে
      dishes: m.dishes.map((d) => ({
        ...d,
        checkinCount: Object.values(checkins).filter((v) => v === d.id).length,
      })),
    }));
}

export async function createMenu(date, dishes) {
  await delay(500);
  const dow = new Date(date + "T00:00:00Z").getUTCDay();
  if (dow === 5 || dow === 6) throw new Error("Lunch is only available Sunday to Thursday");
  if (!dishes.length) throw new Error("Add at least one dish");

  const menus = readMenus();
  if (menus[date]) throw new Error("A menu already exists for this date");

  const menuId = `m-${date}`;
  menus[date] = {
    id: menuId,
    date,
    dayName: dayNameOf(date),
    dishes: dishes.map((d) => ({ id: `d-${++nextDishId}`, name: d.name, description: d.description || "" })),
    createdAt: new Date().toISOString(),
  };
  saveMenus(menus);
  return menus[date];
}

export async function updateMenu(menuId, dishes) {
  await delay(500);
  const menus = readMenus();
  const menu = Object.values(menus).find((m) => m.id === menuId);
  if (!menu) throw new Error("Menu not found");
  if (!dishes.length) throw new Error("Add at least one dish");

  // পুরনো dish id রাখি, নতুনগুলোতে নতুন id
  menu.dishes = dishes.map((d) => ({
    id: d.id || `d-${++nextDishId}`,
    name: d.name,
    description: d.description || "",
  }));
  saveMenus(menus);
  return menu;
}

export async function deleteMenu(menuId) {
  await delay(400);
  const menus = readMenus();
  const menu = Object.values(menus).find((m) => m.id === menuId);
  if (!menu) throw new Error("Menu not found");

  // কতজন check-in করেছিল
  const checkins = readCheckins();
  const affected = menu.dishes.reduce(
    (n, d) => n + Object.values(checkins).filter((v) => v === d.id).length,
    0
  );

  delete menus[menu.date];
  saveMenus(menus);
  return { affected };
}
