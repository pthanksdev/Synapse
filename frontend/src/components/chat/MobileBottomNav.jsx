import { MessageSquareIcon, UsersIcon, UserPlusIcon, SettingsIcon, ShieldAlertIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useNavigate } from "react-router";

export function MobileBottomNav({ onOpenProfile }) {
  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const authUser = useAuthStore((state) => state.authUser);
  const { activeConversationId, isLargeScreen } = useSelectedConversation();
  const navigate = useNavigate();

  // If a chat conversation is currently open on a mobile screen, hide bottom nav to maximize composer space
  if (!isLargeScreen && activeConversationId) {
    return null;
  }

  const handleTabClick = (tab) => {
    setSidebarTab(tab);
    // On mobile, clearing active conversation returns to list view
    setActiveConversationId(null);
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around border border-border/80 bg-background/95 backdrop-blur-xl px-2 py-1.5 lg:hidden shadow-2xl rounded-2xl">
      <button
        onClick={() => handleTabClick("chats")}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
          sidebarTab === "chats"
            ? "text-accent font-semibold bg-accent/10"
            : "text-muted hover:text-foreground"
        }`}
      >
        <MessageSquareIcon className="size-5" />
        <span className="text-[10px]">Chats</span>
      </button>

      <button
        onClick={() => handleTabClick("groups")}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
          sidebarTab === "groups"
            ? "text-accent font-semibold bg-accent/10"
            : "text-muted hover:text-foreground"
        }`}
      >
        <UsersIcon className="size-5" />
        <span className="text-[10px]">Groups</span>
      </button>

      <button
        onClick={() => handleTabClick("users")}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
          sidebarTab === "users"
            ? "text-accent font-semibold bg-accent/10"
            : "text-muted hover:text-foreground"
        }`}
      >
        <UserPlusIcon className="size-5" />
        <span className="text-[10px]">People</span>
      </button>

      {authUser?.role === "admin" && (
        <button
          onClick={() => navigate("/admin")}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-red-400 hover:text-red-500 transition"
        >
          <ShieldAlertIcon className="size-5" />
          <span className="text-[10px]">Admin</span>
        </button>
      )}

      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-muted hover:text-foreground transition"
      >
        <SettingsIcon className="size-5" />
        <span className="text-[10px]">Settings</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
