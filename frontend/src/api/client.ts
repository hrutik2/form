import axios from "axios";
import { API_BASE_URL } from "../lib/constants";
import { showToast } from "../lib/toastStore";

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("builder_token");
  const url = config.url ?? "";
  const isPublicRoute = url.startsWith("/public/");

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const detail = response.data?.detail;

    if (detail && method && method !== "get") {
      showToast({
        kind: "success",
        detail
      });
    }
    return response;
  },
  (error) => {
    showToast({
      kind: "error",
      detail: error.response?.data?.detail ?? "Request failed"
    });
    return Promise.reject(error);
  }
);
