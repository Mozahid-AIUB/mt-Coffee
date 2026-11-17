// ======================================================================
// নকল (mock) API — Admin Employee Management।
//   getUsers()          -> GET   /api/admin/users?search=
//   toggleActive()      -> PATCH /api/admin/users/:id/active
// ======================================================================

const KEY = "mt_demo_users";

const SEED_USERS = [
  { id: "u1", fullName: "Mozahid Islam", employeeId: "MT-001", phone: "01712345678", email: "mozahid@manushtech.com", role: "employee", isActive: true },
  { id: "u2", fullName: "Rafiq Ahmed", employeeId: "MT-002", phone: "01812345679", email: "rafiq@manushtech.com", role: "employee", isActive: true },
  { id: "u3", fullName: "Nusrat Jahan", employeeId: "MT-003", phone: "01912345680", email: "nusrat@manushtech.com", role: "employee", isActive: true },
  { id: "u4", fullName: "Tanvir Hasan", employeeId: "MT-004", phone: "01612345681", email: "tanvir@manushtech.com", role: "employee", isActive: true },
  { id: "u5", fullName: "Fatema Akter", employeeId: "MT-005", phone: "01512345682", email: "fatema@manushtech.com", role: "employee", isActive: false },
  { id: "u6", fullName: "Sakib Rahman", employeeId: "MT-006", phone: "01312345683", email: "sakib@manushtech.com", role: "employee", isActive: true },
  { id: "u7", fullName: "Mitu Begum", employeeId: "MT-007", phone: "01412345684", email: "mitu@manushtech.com", role: "employee", isActive: true },
  { id: "admin-1", fullName: "Admin User", employeeId: "ADMIN001", phone: "01712340000", email: "admin@manushtech.com", role: "admin", isActive: true },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function readUsers() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  saveUsers(SEED_USERS);
  return SEED_USERS;
}

function saveUsers(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export async function getUsers(search) {
  await delay(400);
  let users = readUsers();
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }
  return users;
}

export async function toggleActive(userId, isActive) {
  await delay(400);
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  if (user.role === "admin") throw new Error("Cannot deactivate admin accounts");
  user.isActive = isActive;
  saveUsers(users);
  return user;
}
