import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      groups: [],
      messages: [],
      pinnedChats: [],
      blockedUsers: [],
      selectedUser: null,
      activeGroup: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isGroupsLoading: false,
      isMessagesLoading: false,
      isFetchingMore: false,
      hasMoreMessages: true,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,
      replyingToMessage: null,
      activeLightboxMedia: null,
      unreadCount: 0,
      drafts: {}, // { [conversationId]: "draft text" }
      outboxQueue: [], // Offline pending messages

      initNotifications: () => {
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }

        // Listen for online event to process offline queue
        window.addEventListener("online", () => {
          toast.success("Back online! Retrying unsent messages...", { id: "online-retry" });
          get().processOutboxQueue();
        });
      },

      // Draft Management
      setDraft: (conversationId, text) => {
        if (!conversationId) return;
        set((state) => ({
          drafts: {
            ...state.drafts,
            [conversationId]: text,
          },
        }));
      },

      clearDraft: (conversationId) => {
        if (!conversationId) return;
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[conversationId];
          return { drafts: newDrafts };
        });
      },

      clearUnreadCount: () => {
        set({ unreadCount: 0 });
        document.title = "Synapse";
      },

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/users/sidebar/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in getUsers:", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/users/sidebar/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations:", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
          const res = await axiosInstance.get("/groups");
          set({ groups: res.data });
        } catch (error) {
          console.log("Error in getGroups:", error.message);
        } finally {
          set({ isGroupsLoading: false });
        }
      },

      getMessages: async (id) => {
        if (!id) return;
        set({ isMessagesLoading: true });
        const { activeGroup, drafts } = get();

        // Restore saved draft for this conversation
        const savedDraft = drafts[id] || "";
        set({ composerText: savedDraft });

        try {
          const url = activeGroup
            ? `/groups/${id}/messages?limit=50&skip=0`
            : `/messages/${id}?limit=50&skip=0`;

          const res = await axiosInstance.get(url);
          set({
            messages: res.data,
            hasMoreMessages: res.data.length === 50,
          });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      loadMoreMessages: async () => {
        const { activeConversationId, activeGroup, messages, hasMoreMessages, isFetchingMore } = get();
        if (!activeConversationId || !hasMoreMessages || isFetchingMore) return;

        set({ isFetchingMore: true });
        try {
          const baseUrl = activeGroup ? `/groups/${activeConversationId}/messages` : `/messages/${activeConversationId}`;
          const res = await axiosInstance.get(`${baseUrl}?limit=50&skip=${messages.length}`);
          set({
            messages: [...res.data, ...messages],
            hasMoreMessages: res.data.length === 50,
          });
        } catch (error) {
          toast.error("Failed to load older messages");
        } finally {
          set({ isFetchingMore: false });
        }
      },

      // Process Offline Queued Outbox Messages
      processOutboxQueue: async () => {
        const { outboxQueue } = get();
        if (!outboxQueue || outboxQueue.length === 0) return;

        const remainingQueue = [];
        for (const item of outboxQueue) {
          try {
            const url = item.isGroup
              ? `/groups/${item.conversationId}/messages`
              : `/messages/send/${item.conversationId}`;
            await axiosInstance.post(url, item.payload);
            toast.success("Queued offline message sent!");
          } catch {
            remainingQueue.push(item);
          }
        }
        set({ outboxQueue: remainingQueue });
      },

      sendMessage: async (messageData) => {
        const { activeConversationId, activeGroup, messages, replyingToMessage, outboxQueue } = get();
        if (!activeConversationId) return false;

        const payload =
          messageData instanceof FormData
            ? messageData
            : { ...messageData, replyToId: replyingToMessage?._id || replyingToMessage?.id };

        try {
          const url = activeGroup
            ? `/groups/${activeConversationId}/messages`
            : `/messages/send/${activeConversationId}`;

          const res = await axiosInstance.post(url, payload);
          set({ messages: [...messages, res.data], composerText: "", replyingToMessage: null });
          get().clearDraft(activeConversationId);
          if (!activeGroup) get().getConversations();
          return true;
        } catch (error) {
          // If offline or network error, save to Outbox Queue
          if (!navigator.onLine || !error.response) {
            const tempId = `temp_${Date.now()}`;
            const optimisticMsg = {
              _id: tempId,
              senderId: useAuthStore.getState().authUser?._id,
              text: typeof messageData === "object" ? messageData.text : "Media",
              createdAt: new Date().toISOString(),
              isPending: true,
            };

            set({
              messages: [...messages, optimisticMsg],
              composerText: "",
              outboxQueue: [
                ...outboxQueue,
                {
                  id: tempId,
                  conversationId: activeConversationId,
                  payload: typeof messageData === "object" ? messageData : {},
                  isGroup: !!activeGroup,
                },
              ],
            });

            get().clearDraft(activeConversationId);
            toast("Offline: Message queued and will send automatically when reconnected", { icon: "📡" });
            return true;
          }

          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      toggleReaction: async (messageId, emoji) => {
        try {
          const res = await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
          set((state) => ({
            messages: state.messages.map((m) => (m._id === messageId ? res.data : m)),
          }));
        } catch (error) {
          toast.error("Failed to add reaction");
        }
      },

      unsendMessage: async (messageId) => {
        try {
          const res = await axiosInstance.delete(`/messages/${messageId}/unsend`);
          set((state) => ({
            messages: state.messages.map((m) => (m._id === messageId ? res.data : m)),
          }));
          toast.success("Message unsent");
        } catch (error) {
          toast.error(error.response?.data?.message || "Cannot unsend message");
        }
      },

      togglePinConversation: async (userId) => {
        try {
          const res = await axiosInstance.post(`/users/pin/${userId}`);
          set({ pinnedChats: res.data.pinnedChats });
          toast.success("Conversation pinned state updated");
        } catch (error) {
          toast.error("Failed to pin conversation");
        }
      },

      toggleBlockUser: async (userId) => {
        try {
          const res = await axiosInstance.post(`/users/block/${userId}`);
          set({ blockedUsers: res.data.blockedUsers });
          toast.success("User block state updated");
        } catch (error) {
          toast.error("Failed to block user");
        }
      },

      setReplyingToMessage: (replyingToMessage) => set({ replyingToMessage }),
      setActiveLightboxMedia: (activeLightboxMedia) => set({ activeLightboxMedia }),

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("group:newMessage");
        socket.off("notification:mention");
        socket.off("message:reaction");
        socket.off("message:unsent");

        socket.on("newMessage", (newMessage) => {
          const activeId = get().activeConversationId;
          const authUser = useAuthStore.getState().authUser;

          if (
            activeId &&
            !get().activeGroup &&
            (String(newMessage.senderId) === String(activeId) ||
              String(newMessage.receiverId) === String(activeId))
          ) {
            set({ messages: [...get().messages, newMessage] });
          } else if (String(newMessage.receiverId) === String(authUser?._id)) {
            const newCount = get().unreadCount + 1;
            set({ unreadCount: newCount });
            document.title = `(${newCount}) Synapse`;
          }
          get().getConversations();
        });

        socket.on("group:newMessage", (newMessage) => {
          const activeId = get().activeConversationId;
          if (activeId && get().activeGroup && String(newMessage.groupId) === String(activeId)) {
            set({ messages: [...get().messages, newMessage] });
          }
        });

        socket.on("notification:mention", (data) => {
          toast(`You were mentioned by ${data.senderName} in ${data.groupName}!`, { icon: "📣" });
        });

        socket.on("message:reaction", (updatedMessage) => {
          set((state) => ({
            messages: state.messages.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
          }));
        });

        socket.on("message:unsent", (updatedMessage) => {
          set((state) => ({
            messages: state.messages.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
          }));
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("group:newMessage");
        socket?.off("notification:mention");
        socket?.off("message:reaction");
        socket?.off("message:unsent");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser, activeGroup: null }),
      
      setActiveGroup: (group) => {
        set({
          activeGroup: group,
          selectedUser: null,
          activeConversationId: group ? group._id : null,
          messages: [],
        });
        if (group) get().getMessages(group._id);
      },

      setActiveConversationId: (activeConversationId) => {
        if (activeConversationId) get().clearUnreadCount();

        const group = get().groups.find((g) => g._id === activeConversationId);
        if (group) {
          get().setActiveGroup(group);
          return;
        }

        set((state) => ({
          activeConversationId,
          activeGroup: null,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
          hasMoreMessages: true,
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "synapse-storage",
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
        drafts: state.drafts,
        outboxQueue: state.outboxQueue,
      }),
    },
  ),
);
