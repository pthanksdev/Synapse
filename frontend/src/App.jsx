import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import GroupJoinPage from "./pages/GroupJoinPage";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useEffect } from "react";

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

  if (isCheckingAuth) return <PageLoader />;

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={authUser ? <ChatPage /> : <LandingPage />}
          />
          <Route
            path="/auth"
            element={!authUser ? <AuthPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/join/group/:inviteCode"
            element={authUser ? <GroupJoinPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={authUser ? <AdminPage /> : <Navigate to="/auth" replace />}
          />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
