import axios from "axios";
import { API_BASE_URL } from "../lib/constants";
import { showToast } from "../lib/toastStore";

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("builder_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    showToast({
      kind: "success",
      title: `${response.config.method?.toUpperCase() ?? "API"} ${response.status}`,
      detail: response.config.url
    });
    return response;
  },
  (error) => {
    showToast({
      kind: "error",
      title: error.response
        ? `${error.config?.method?.toUpperCase() ?? "API"} ${error.response.status}`
        : "Network error",
      detail: error.response?.data?.detail ?? error.config?.url ?? "Request failed"
    });
    return Promise.reject(error);
  }
);
