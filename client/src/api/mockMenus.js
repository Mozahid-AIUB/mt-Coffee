// Shared mock store for lunch menus and check-ins.
// Both the employee and admin lunch pages read from it.
import { weekDates, dayNameOf } from "../utils/dhaka";

const MENU_KEY = "mt_demo_menus";
const CHECKIN_KEY = "mt_demo_checkins";
const CHECKIN_DETAIL_KEY = "mt_demo_checkin_details";

// Mock employee list for the report
export const FAKE_EMPLOYEES = [
  { id: "u1", fullName: "Mozahid Islam", employeeId: "MT-001" },
  { id: "u2", fullName: "Rafiq Ahmed", employeeId: "MT-002" },
  { id: "u3", fullName: "Nusrat Jahan", employeeId: "MT-003" },
  { id: "u4", fullName: "Tanvir Hasan", employeeId: "MT-004" },
  { id: "u5", fullName: "Fatema Akter", employeeId: "MT-005" },
  { id: "u6", fullName: "Sakib Rahman", employeeId: "MT-006" },
  { id: "u7", fullName: "Mitu Begum", employeeId: "MT-007" },
];

// Seed data for the first run
const SEED_MENUS = (() => {
  const dates = weekDates();
  const dishes = [
    [
      { name: "Chicken Biryani", description: "Basmati rice, roasted chicken, boiled egg" },
      { name: "Beef Tehari", description: "Spiced rice with tender beef" },
    ],
    null, // no menu on this day
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
  // Start from the seed data on the first run
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

// Detailed check-ins for the report: who picked which dish, and when
export function readCheckinDetails() {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_DETAIL_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveCheckinDetails(map) {
  try {
    localStorage.setItem(CHECKIN_DETAIL_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

// Seed some check-ins so the report page has something to show
export function seedCheckinDetails() {
  const details = readCheckinDetails();
  const menus = readMenus();
  const checkins = readCheckins();
  // Skip if the data was seeded already
  if (Object.keys(details).length > 0) return;

  const dates = Object.keys(menus);
  if (dates.length === 0) return;

  // Give a few employees a random dish on each date
  dates.forEach((date) => {
    const menu = menus[date];
    if (!menu || menu.dishes.length === 0) return;
    // Between 3 and 6 employees check in
    const count = 3 + Math.floor(Math.random() * 4);
    const emps = FAKE_EMPLOYEES.slice(0, Math.min(count, FAKE_EMPLOYEES.length));
    emps.forEach((emp) => {
      const dish = menu.dishes[Math.floor(Math.random() * menu.dishes.length)];
      const key = `${menu.id}:${emp.id}`;
      checkins[menu.id] = checkins[menu.id] || dish.id; // simple checkin map
      details[key] = {
        userId: emp.id,
        fullName: emp.fullName,
        employeeId: emp.employeeId,
        menuId: menu.id,
        date,
        dishId: dish.id,
        dishName: dish.name,
        checkedInAt: new Date(date + "T09:30:00+06:00").toISOString(),
      };
    });
  });
  saveCheckins(checkins);
  saveCheckinDetails(details);
}
