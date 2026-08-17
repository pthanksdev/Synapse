import { useEffect, useState } from "react";
import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { APP_NAME, AppLogo } from "../AppLogo";

import { LogOutIcon, MessageSquareIcon, PinIcon, PlusIcon, UsersIcon, ShieldAlertIcon, SettingsIcon, StarIcon } from "lucide-react";
import { ConversationRow } from "./ConversationRow";
import { CreateGroupModal } from "./CreateGroupModal";
import { ProfileModal } from "./ProfileModal";
import { StarredMessagesDrawer } from "./StarredMessagesDrawer";
import { StoriesBar } from "./StoriesBar";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

function mapUserForList(user, onlineUsers) {
  return {
    conversationId: user._id,
    id: user._id,
    name: user.fullName,
    avatarUrl: user.profilePic,
    initials: getInitials(user.fullName || "User"),
    isOnline: onlineUsers.includes(user._id),
    peer: {
      name: user.fullName,
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName || "User"),
      isOnline: onlineUsers.includes(user._id),
    },
  };
}

function mapGroupForList(group) {
  return {
    conversationId: group._id,
    id: group._id,
    name: group.name,
    avatarUrl: group.avatar,
    initials: getInitials(group.name || "Group"),
    isGroup: true,
    peer: {
      name: group.name,
      avatarUrl: group.avatar,
      initials: getInitials(group.name || "Group"),
      isOnline: true,
      subtitle: `${group.memberIds?.length || 0} members`,
    },
  };
}

function ChatSidebar() {
  const navigate = useNavigate();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStarredOpen, setIsStarredOpen] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const groups = useChatStore((state) => state.groups);
  const getGroups = useChatStore((state) => state.getGroups);

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setActiveGroup = useChatStore((state) => state.setActiveGroup);
  const pinnedChats = useChatStore((state) => state.pinnedChats);
  const togglePinConversation = useChatStore((state) => state.togglePinConversation);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const authUser = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const conversationUsers = conversations.map((user) => mapUserForList(user, onlineUsers));
  const allUsers = users.map((user) => mapUserForList(user, onlineUsers));
  const allGroups = groups.map((g) => mapGroupForList(g));

  const filteredConversations = normalizedSearchQuery
    ? conversationUsers.filter((conversation) =>
        conversation.peer.name.toLowerCase().includes(normalizedSearchQuery)
      )
    : conversationUsers;

  const pinnedList = filteredConversations.filter((c) => pinnedChats.includes(c.id));
  const unpinnedList = filteredConversations.filter((c) => !pinnedChats.includes(c.id));

  const filteredUsers = normalizedSearchQuery
    ? allUsers.filter((user) => user.name.toLowerCase().includes(normalizedSearchQuery))
    : allUsers;

  const filteredGroups = normalizedSearchQuery
    ? allGroups.filter((g) => g.name.toLowerCase().includes(normalizedSearchQuery))
    : allGroups;

  return (
    <aside
      className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 bg-background ${
        !isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(g) => {
          getGroups();
          setActiveGroup(g);
        }}
      />

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <StarredMessagesDrawer isOpen={isStarredOpen} onClose={() => setIsStarredOpen(false)} />

      <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
          <AppLogo size={32} className="size-8 shrink-0 rounded-[9px] sm:size-8.5" alt="" />
          <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
            {APP_NAME}
          </p>

          <div className="flex items-center gap-1">
            {authUser?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                title="Master Owner Control Center"
                className="rounded-lg p-1.5 text-red-400 hover:bg-surface hover:text-red-500"
              >
                <ShieldAlertIcon className="size-4.5" />
              </button>
            )}

            <button
              onClick={() => setIsStarredOpen(true)}
              title="Starred Messages"
              className="rounded-lg p-1.5 text-amber-400 hover:bg-surface hover:text-amber-300"
            >
              <StarIcon className="size-4.5" />
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              title="Edit Profile & Settings"
              className="group relative rounded-full ring-1 ring-border p-0.5 hover:ring-accent transition"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={authUser?.profilePic} alt={authUser?.fullName} />
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(authUser?.fullName || "Me")}
                </AvatarFallback>
              </Avatar>
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              title="Profile Settings"
              className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
            >
              <SettingsIcon className="size-4.5" />
            </button>

            <button
              onClick={logout}
              title="Log Out"
              className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
            >
              <LogOutIcon className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 24-Hour Stories Bar */}
      <StoriesBar />

      <Tabs
        value={sidebarTab}
        onValueChange={(key) => setSidebarTab(String(key))}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
          <Input
            placeholder="Search messages, people or groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl h-9 bg-surface/40"
          />
        </div>

        <div className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="chats" className="gap-1 text-xs">
              <MessageSquareIcon className="size-3.5 opacity-80" /> Chats
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs">
              <UsersIcon className="size-3.5 opacity-80" /> Groups
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              People
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chats Panel */}
        <TabsContent value="chats" className="flex-1 overflow-x-hidden overflow-y-auto outline-none space-y-2 py-1">
          {pinnedList.length > 0 && (
            <div className="px-3 pt-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-muted mb-2">
                <PinIcon className="size-3" /> Pinned Chats
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pinnedList.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveConversationId(chat.id)}
                    className="flex flex-col items-center justify-center rounded-xl p-2 transition hover:bg-surface"
                  >
                    <Avatar className="size-10 mb-1">
                      <AvatarImage src={chat.peer.avatarUrl} />
                      <AvatarFallback>{chat.peer.initials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium w-full text-center">
                      {chat.peer.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {unpinnedList.length === 0 && pinnedList.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No conversations match your search.
            </p>
          ) : (
            unpinnedList.map((conversation) => (
              <div key={conversation.id} className="group relative">
                <ConversationRow
                  user={conversation}
                  selected={conversation.id === activeConversationId}
                  onSelect={() => setActiveConversationId(conversation.id)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinConversation(conversation.id);
                  }}
                  title="Pin conversation"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:block rounded-lg p-1.5 bg-surface/80 text-muted hover:text-foreground shadow"
                >
                  <PinIcon className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </TabsContent>

        {/* Groups Panel */}
        <TabsContent value="groups" className="flex-1 overflow-x-hidden overflow-y-auto outline-none p-2 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold"
          >
            <PlusIcon className="size-4 text-accent" /> Create New Group
          </Button>

          {filteredGroups.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted">You are not in any group chats yet.</p>
          ) : (
            filteredGroups.map((group) => (
              <ConversationRow
                key={group.id}
                user={group}
                selected={group.id === activeConversationId}
                onSelect={() => setActiveGroup(groups.find((g) => g._id === group.id))}
              />
            ))
          )}
        </TabsContent>

        {/* Users / People Panel */}
        <TabsContent value="users" className="flex-1 overflow-x-hidden overflow-y-auto outline-none">
          {filteredUsers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No people match your search.</p>
          ) : (
            filteredUsers.map((user) => (
              <ConversationRow
                key={user.conversationId}
                user={user}
                selected={user.conversationId === activeConversationId}
                onSelect={() => setActiveConversationId(user.conversationId)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

export default ChatSidebar;
