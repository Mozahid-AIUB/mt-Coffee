import api from "./axios";

export async function getWeek() {
  const res = await api.get("/lunch/week");
  return res.data;
}

export async function checkin(menuId, dishId) {
  const res = await api.post("/lunch/checkin", { menuId, dishId });
  return res.data;
}

export async function cancelCheckin(menuId) {
  const res = await api.delete(`/lunch/checkin/${menuId}`);
  return res.data;
}
