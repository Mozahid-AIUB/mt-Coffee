// Where each role lands after signing in
export const homePathFor = (user) =>
  user?.role === "admin" ? "/admin/snacks" : "/lunch";
