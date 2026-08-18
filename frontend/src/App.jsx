import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navigate, Route, Routes } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import GroupJoinPage from "./pages/GroupJoinPage";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";

const AdminPage = lazy(() => import("./pages/AdminPage"));

import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/LandingPage";

function App() {
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const initNotifications = useChatStore((state) => state.initNotifications);

  useEffect(() => {
    checkAuth();
    initNotifications();
  }, [checkAuth, initNotifications]);



  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={
              authUser ? (
                authUser.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <ChatPage />
                )
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/auth"
            element={
              !authUser ? (
                <AuthPage />
              ) : (
                <Navigate to={authUser?.role === "admin" ? "/admin" : "/"} replace />
              )
            }
          />
          <Route
            path="/chat"
            element={authUser ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/join/group/:inviteCode"
            element={authUser ? <GroupJoinPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={
              authUser?.role === "admin" ? (
                <Suspense fallback={<PageLoader />}>
                  <AdminPage />
                </Suspense>
              ) : (
                <Navigate to={authUser ? "/" : "/auth"} replace />
              )
            }
          />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
