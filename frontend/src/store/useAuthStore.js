import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  onlineUsers: [],
  socket: null,
  typingUsers: {}, // { [userId]: true }

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket(res.data);
    } catch {
      // Try refresh
      try {
        const refreshRes = await axiosInstance.post("/auth/refresh");
        if (refreshRes.data.accessToken) {
          localStorage.setItem("synapse_access_token", refreshRes.data.accessToken);
          set({ authUser: refreshRes.data.user });
          get().connectSocket(refreshRes.data.user);
        }
      } catch {
        set({ authUser: null });
        localStorage.removeItem("synapse_access_token");
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", formData);
      if (res.data.accessToken) {
        localStorage.setItem("synapse_access_token", res.data.accessToken);
      }
      set({ authUser: res.data.user });
      get().connectSocket(res.data.user);
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      if (res.data.accessToken) {
        localStorage.setItem("synapse_access_token", res.data.accessToken);
      }
      set({ authUser: res.data.user });
      get().connectSocket(res.data.user);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      localStorage.removeItem("synapse_access_token");
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out");
    }
  },

  clearAuth: () => {
    localStorage.removeItem("synapse_access_token");
    set({ authUser: null, isCheckingAuth: false, onlineUsers: [] });
    get().disconnectSocket();
  },

  connectSocket: (user) => {
    if (!user || get().socket?.connected) return;

    const token = localStorage.getItem("synapse_access_token");

    const socket = io(BASE_URL, {
      auth: { token },
      query: { userId: user._id },
      withCredentials: true,
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("typing:start", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });

    socket.on("typing:stop", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null, typingUsers: {} });
  },
}));
