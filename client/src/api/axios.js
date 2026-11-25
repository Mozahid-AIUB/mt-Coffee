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

// refresh token cookie-তে থাকে, তাই আলাদা instance দিয়েই কল করা যায়।
// একই instance ব্যবহার করলে refresh নিজেও 401 খেয়ে অসীম লুপে পড়ত।
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// একসাথে কয়েকটা কল 401 খেলে যেন একবারই refresh হয়
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

    // শুধু একবারই retry করি, আর login/refresh কলের 401 ছেড়ে দিই
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
      // refresh-ও ব্যর্থ — সেশন শেষ, লগইন পেজে পাঠাই
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
