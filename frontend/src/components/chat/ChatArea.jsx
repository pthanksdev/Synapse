import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import ChatComposer from "./ChatComposer";
import { SharedMediaDrawer } from "./SharedMediaDrawer";
import { GroupDetailsDrawer } from "./GroupDetailsDrawer";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";
import { useWallpaper } from "../../context/wallpaper";

export default function ChatArea() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();
  const activeGroup = useChatStore((state) => state.activeGroup);
  const { frameStyle, wallpaper } = useWallpaper();

  const hasWallpaper = Boolean(wallpaper?.url);

  return (
    <main
      className={`relative flex flex-1 flex-col overflow-hidden bg-background h-dvh w-full ${
        !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
      }`}
      style={hasWallpaper ? frameStyle : undefined}
    >
      {/* Background Overlay for readable text & message bubbles over custom wallpapers */}
      {hasWallpaper && (
        <div className="absolute inset-0 bg-background/65 pointer-events-none z-0" />
      )}

      <ChatHeader onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)} />
      <MessageList />
      {activeConversation ? <ChatComposer /> : null}

      {activeGroup ? (
        <GroupDetailsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      ) : (
        <SharedMediaDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      )}
    </main>
  );
}
