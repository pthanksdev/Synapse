import { ArchiveIcon, XIcon, RotateCcwIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getInitials } from "../../hooks/useSelectedConversation";
import { ConversationRow } from "./ConversationRow";
import { Button } from "../ui/button";

export function ArchivedChatsDrawer({ isOpen, onClose }) {
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const groups = useChatStore((state) => state.groups);
  const archivedChats = useChatStore((state) => state.archivedChats) || [];
  const toggleArchiveConversation = useChatStore((state) => state.toggleArchiveConversation);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setActiveGroup = useChatStore((state) => state.setActiveGroup);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  if (!isOpen) return null;

  // Build combined map of all possible user and group chats
  const conversationUsers = conversations.map((user) => ({
    conversationId: user._id,
    id: user._id,
    name: user.fullName,
    username: user.username,
    avatarUrl: user.profilePic,
    initials: getInitials(user.fullName || "User"),
    isOnline: onlineUsers.includes(user._id),
    peer: {
      name: user.fullName,
      username: user.username,
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName || "User"),
      isOnline: onlineUsers.includes(user._id),
    },
  }));

  const allGroups = groups.map((g) => ({
    conversationId: g._id,
    id: g._id,
    name: g.name,
    avatarUrl: g.avatar,
    initials: getInitials(g.name || "Group"),
    isGroup: true,
    peer: {
      name: g.name,
      avatarUrl: g.avatar,
      initials: getInitials(g.name || "Group"),
      isOnline: true,
      subtitle: `${g.memberIds?.length || 0} members`,
    },
  }));

  const allChats = [...conversationUsers, ...allGroups];
  const archivedList = allChats.filter((c) => archivedChats.includes(c.id));

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <ArchiveIcon className="size-4.5 text-accent" /> Archived Chats ({archivedList.length})
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground transition"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 py-4">
        {archivedList.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ArchiveIcon className="size-12 text-muted mx-auto opacity-40" />
            <p className="text-sm font-semibold text-foreground">No archived chats</p>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Hover over any chat in your sidebar and click the archive button to move it here.
            </p>
          </div>
        ) : (
          archivedList.map((chat) => (
            <div key={chat.id} className="group relative flex items-center">
              <div className="flex-1">
                <ConversationRow
                  user={chat}
                  selected={chat.id === activeConversationId}
                  onSelect={() => {
                    if (chat.isGroup) {
                      const foundGroup = groups.find((g) => g._id === chat.id);
                      if (foundGroup) setActiveGroup(foundGroup);
                    } else {
                      setActiveConversationId(chat.id);
                    }
                    onClose();
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleArchiveConversation(chat.id);
                }}
                title="Unarchive Chat"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl text-xs gap-1 bg-surface/90 hover:bg-accent hover:text-accent-foreground shadow"
              >
                <RotateCcwIcon className="size-3.5" />
                <span className="text-[10px]">Unarchive</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ArchivedChatsDrawer;
