import api from "./axios";

export async function getMenus() {
  const res = await api.get("/lunch/week");
  return res.data.data ? [res.data.data] : [];
}

export async function createMenu(date, dishes) {
  const res = await api.post("/admin/lunch/menu", { date, dishes });
  return res.data;
}

export async function getReport(date) {
  const res = await api.get("/admin/lunch/report", { params: { date } });
  const raw = res.data.data;
  if (!raw) return null;
  return {
    ...raw,
    total: raw.totalSelections,
    perDish: Object.entries(raw.dishCounts).map(([name, count]) => ({ name, count })),
  };
}

export async function exportCSV(date) {
  const report = await getReport(date);
  if (!report) return "";
  const header = "Employee Name,Employee ID,Dish,Check-in Time";
  const rows = (report.employees || []).map((e) =>
    `"${e.fullName}","${e.employeeId}","${e.dishName}","${new Date(e.checkedInAt).toLocaleString()}"`
  );
  return [header, ...rows].join("\n");
}
export async function updateMenu(menuId, dishes) {
  throw new Error("Update menu is not available yet");
}

export async function deleteMenu(menuId) {
  throw new Error("Delete menu is not available yet");
}
