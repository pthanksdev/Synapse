import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// John Doe -> JD
export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("");
}

// mapUserToConversation is an adapter — it converts the raw backend shapes (a user document + an array of message documents) into the clean view-model that the chat UI components expect to render.

// Two transformations happen:
// 1. Messages → UI messages
// 2. User → peer

function mapUserToConversation({ user, messages, authUser, onlineUsers }) {
  const mappedMessages = messages.map((message) => ({
    id: message._id,
    _id: message._id,
    role: String(message.senderId) === String(authUser?._id) ? "me" : "them",
    text: message.text || "",
    time: formatMessageTime(message.createdAt),
    imageUrl: message.image,
    videoUrl: message.video,
    audioUrl: message.audio,
    fileUrl: message.fileUrl,
    fileName: message.fileName,
    fileSize: message.fileSize,
    reactions: message.reactions || [],
    replyTo: message.replyTo,
    isUnsent: message.isUnsent,
    status: message.status,
    createdAt: message.createdAt,
  }));

  return {
    id: user._id,
    peer: {
      name: user.fullName,
      subtitle: user.email,
      isOnline: onlineUsers.includes(user._id),
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName),
    },
    messages: mappedMessages,
  };
}

function mapGroupToConversation({ group, messages, authUser }) {
  const mappedMessages = messages.map((message) => {
    const sender = message.senderId;
    const isMe = String(sender?._id || sender) === String(authUser?._id);
    const senderName = isMe ? "You" : (sender?.fullName || sender?.username || "Group Member");

    return {
      id: message._id,
      _id: message._id,
      role: isMe ? "me" : "them",
      senderName,
      text: message.text || "",
      time: formatMessageTime(message.createdAt),
      imageUrl: message.image,
      videoUrl: message.video,
      audioUrl: message.audio,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      reactions: message.reactions || [],
      replyTo: message.replyTo,
      isUnsent: message.isUnsent,
      status: message.status,
      createdAt: message.createdAt,
    };
  });

  return {
    id: group._id,
    isGroup: true,
    peer: {
      name: group.name,
      subtitle: `${group.memberIds?.length || 0} members`,
      isOnline: true,
      avatarUrl: group.avatar,
      initials: getInitials(group.name || "Group"),
    },
    messages: mappedMessages,
  };
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const activeGroup = useChatStore((state) => state.activeGroup);
  const groups = useChatStore((state) => state.groups);
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const currentGroup = activeGroup || (activeConversationId ? groups.find((g) => g._id === activeConversationId) : null);

  const selectedUser = !currentGroup && activeConversationId
    ? users.find((user) => user._id === activeConversationId) ||
      conversations.find((user) => user._id === activeConversationId)
    : null;

  const activeConversation = currentGroup
    ? mapGroupToConversation({ group: currentGroup, messages, authUser })
    : selectedUser
    ? mapUserToConversation({ user: selectedUser, messages, authUser, onlineUsers })
    : null;

  return {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  };
}
