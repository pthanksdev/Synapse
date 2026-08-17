import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

// Request interceptor to attach JWT access token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("synapse_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/login" && originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;

      try {
        const refreshRes = await axiosInstance.post("/auth/refresh");
        const newAccessToken = refreshRes.data.accessToken;

        if (newAccessToken) {
          localStorage.setItem("synapse_access_token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem("synapse_access_token");
      }
    }

    return Promise.reject(error);
  }
);
