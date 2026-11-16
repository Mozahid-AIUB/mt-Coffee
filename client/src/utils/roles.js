// Login এর পর কোন পেজে যাবে
export const homePathFor = (user) =>
  user?.role === "admin" ? "/admin/snacks" : "/lunch";
