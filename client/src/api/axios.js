import axios from "axios";

const TOKEN_KEY = "mt_access_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The refresh token lives in a cookie, so a separate instance can send it.
// Reusing `api` here would let a failing refresh retry itself forever.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Share one refresh between every request that got a 401 at the same time
let refreshing = null;

function refreshAccessToken() {
  refreshing ??= refreshClient
    .post("/auth/refresh")
    .then((res) => {
      const token = res.data.data.accessToken;
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Retry once only, and leave 401s from the auth calls alone
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      original.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      // Refresh failed too: the session is over, so send the user to login
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("mt_demo_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  }
);

export default api;
