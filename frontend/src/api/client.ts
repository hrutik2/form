import axios from "axios";
import { API_BASE_URL } from "../lib/constants";

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
