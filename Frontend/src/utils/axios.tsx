import axios from "axios";
import { BACKEND_URL } from "./Config";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config; // Return the modified config
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/login"
    ) {
      originalRequest._retry = true; // Mark the original request as retried

      console.warn(
        "Access token expired or unauthorized. Redirecting to login."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken"); // Clear if you were storing it
      localStorage.removeItem("userEmail"); // Clear if you were storing it
      localStorage.removeItem("userId"); // Clear if you were storing it

      window.location.href = "/auth/login";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
