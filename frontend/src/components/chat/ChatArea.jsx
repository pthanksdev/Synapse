import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import ChatComposer from "./ChatComposer";
import { SharedMediaDrawer } from "./SharedMediaDrawer";
import { GroupDetailsDrawer } from "./GroupDetailsDrawer";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";

export default function ChatArea() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();
  const activeGroup = useChatStore((state) => state.activeGroup);

  return (
    <main
      className={`relative flex flex-1 flex-col overflow-hidden bg-background ${
        !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
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
