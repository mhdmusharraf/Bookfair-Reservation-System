import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL 

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["X-Portal"] = "EMPLOYEE";
  return config;
});

let refreshPromise = null;

function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh").finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config || {};
    const url = originalRequest?.url || "";
    if (
      status === 401 &&
      !originalRequest._retry &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register") &&
      !url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        await requestRefresh();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
