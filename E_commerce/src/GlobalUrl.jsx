import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://project-1-backend-fawn.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ecom_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling 401 unauthenticated states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear invalid auth
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/verify-otp") {
        // Optional: can handle token refresh or redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;