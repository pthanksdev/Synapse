import { useEffect, useState } from "react";
import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { APP_NAME, AppLogo } from "../AppLogo";

import {
  LogOutIcon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  UserPlusIcon,
  PinIcon,
  PlusIcon,
  UsersIcon,
  ShieldAlertIcon,
  SettingsIcon,
  StarIcon,
  ArchiveIcon,
} from "lucide-react";
import { ConversationRow } from "./ConversationRow";
import { CreateGroupModal } from "./CreateGroupModal";
import { ProfileModal } from "./ProfileModal";
import { StarredMessagesDrawer } from "./StarredMessagesDrawer";
import { ArchivedChatsDrawer } from "./ArchivedChatsDrawer";
import { StoriesBar } from "./StoriesBar";
import { MobileBottomNav } from "./MobileBottomNav";
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
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const groups = useChatStore((state) => state.groups);
  const getGroups = useChatStore((state) => state.getGroups);
  const getUsers = useChatStore((state) => state.getUsers);
  const getConversations = useChatStore((state) => state.getConversations);

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const searchResults = useChatStore((state) => state.searchResults);
  const searchUsers = useChatStore((state) => state.searchUsers);
  const isSearchingUsers = useChatStore((state) => state.isSearchingUsers);

  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setActiveGroup = useChatStore((state) => state.setActiveGroup);
  const pinnedChats = useChatStore((state) => state.pinnedChats);
  const togglePinConversation = useChatStore((state) => state.togglePinConversation);

  const archivedChats = useChatStore((state) => state.archivedChats) || [];
  const toggleArchiveConversation = useChatStore((state) => state.toggleArchiveConversation);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const authUser = useAuthStore((state) => state.authUser);

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getGroups();
    getUsers();
    getConversations();
  }, [getGroups, getUsers, getConversations]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (normalizedSearchQuery) {
      const timer = setTimeout(() => {
        searchUsers(normalizedSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [normalizedSearchQuery, searchUsers]);

  const conversationUsers = conversations.map((user) => mapUserForList(user, onlineUsers));
  const allUsers = users.map((user) => mapUserForList(user, onlineUsers));
  const mappedSearchResults = searchResults.map((user) => mapUserForList(user, onlineUsers));
  const allGroups = groups.map((g) => mapGroupForList(g));

  const filteredConversations = normalizedSearchQuery
    ? conversationUsers.filter(
        (conversation) =>
          conversation.peer.name.toLowerCase().includes(normalizedSearchQuery) ||
          (conversation.username && conversation.username.toLowerCase().includes(normalizedSearchQuery))
      )
    : conversationUsers;

  // Filter active vs archived conversations
  const activeConversations = filteredConversations.filter(
    (c) => !archivedChats.includes(c.id)
  );

  const allChatsAndGroups = [...conversationUsers, ...allGroups];
  const archivedList = allChatsAndGroups.filter((c) => archivedChats.includes(c.id));

  const pinnedList = activeConversations.filter((c) => pinnedChats.includes(c.id));
  const unpinnedList = activeConversations.filter((c) => !pinnedChats.includes(c.id));

  const filteredUsers = normalizedSearchQuery ? mappedSearchResults : allUsers;

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
      <ArchivedChatsDrawer isOpen={isArchivedOpen} onClose={() => setIsArchivedOpen(false)} />

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
              onClick={() => setSidebarTab("users")}
              title="Start New Conversation"
              className="rounded-lg p-1.5 text-accent hover:bg-surface hover:text-accent-hover transition flex items-center gap-1"
            >
              <MessageSquarePlusIcon className="size-4.5" />
            </button>

            <button
              onClick={() => setIsArchivedOpen(true)}
              title="Archived Chats"
              className="relative rounded-lg p-1.5 text-accent hover:bg-surface"
            >
              <ArchiveIcon className="size-4.5" />
              {archivedList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center shadow">
                  {archivedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsStarredOpen(true)}
              title="Starred Messages"
              className="rounded-lg p-1.5 text-amber-400 hover:bg-surface hover:text-amber-300"
            >
              <StarIcon className="size-4.5" />
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
        <TabsContent value="chats" className="flex-1 overflow-x-hidden overflow-y-auto outline-none space-y-2 py-1 pb-20 lg:pb-2">
          {/* Archived Chats Header Banner */}
          {archivedList.length > 0 && (
            <div className="px-2 pt-1">
              <button
                onClick={() => setIsArchivedOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface/60 rounded-xl transition border border-border/50 bg-surface/20"
              >
                <div className="flex items-center gap-2">
                  <ArchiveIcon className="size-4 text-accent" />
                  <span>Archived Chats</span>
                </div>
                <span className="rounded-full bg-accent/15 text-accent text-[10px] px-2 py-0.5 font-bold">
                  {archivedList.length}
                </span>
              </button>
            </div>
          )}

          {pinnedList.length > 0 && (
            <div className="px-3 pt-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-muted mb-2">
                <PinIcon className="size-3" /> Pinned Chats
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pinnedList.map((chat) => (
                  <div key={chat.id} className="relative group/pin">
                    <button
                      onClick={() => setActiveConversationId(chat.id)}
                      className="w-full flex flex-col items-center justify-center rounded-xl p-2 transition hover:bg-surface"
                    >
                      <Avatar className="size-10 mb-1">
                        <AvatarImage src={chat.peer.avatarUrl} />
                        <AvatarFallback>{chat.peer.initials}</AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs font-medium w-full text-center">
                        {chat.peer.name.split(" ")[0]}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unpinnedList.length === 0 && pinnedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center space-y-3">
              <p className="text-xs text-muted">
                {archivedList.length > 0
                  ? "All matching chats are in Archived Chats."
                  : normalizedSearchQuery
                  ? `No existing chats for "${normalizedSearchQuery}".`
                  : "You don't have any open conversations yet."}
              </p>
              {!normalizedSearchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSidebarTab("users")}
                  className="text-xs font-semibold rounded-xl"
                >
                  <UserPlusIcon className="size-3.5 mr-1.5 text-accent" />
                  Find People to Message
                </Button>
              )}
            </div>
          ) : (
            unpinnedList.map((conversation) => (
              <div key={conversation.id} className="group relative">
                <ConversationRow
                  user={conversation}
                  selected={conversation.id === activeConversationId}
                  onSelect={() => setActiveConversationId(conversation.id)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinConversation(conversation.id);
                    }}
                    title="Pin conversation"
                    className="rounded-lg p-1.5 bg-surface/90 text-muted hover:text-foreground shadow"
                  >
                    <PinIcon className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchiveConversation(conversation.id);
                    }}
                    title="Archive conversation"
                    className="rounded-lg p-1.5 bg-surface/90 text-muted hover:text-accent shadow"
                  >
                    <ArchiveIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Global User Search Results when searching by username */}
          {normalizedSearchQuery && mappedSearchResults.length > 0 && (
            <div className="pt-3 border-t border-border/60">
              <div className="px-3 pb-1.5 text-xs font-semibold text-accent flex items-center gap-1.5">
                <UserPlusIcon className="size-3.5" />
                <span>Found on Synapse ({mappedSearchResults.length})</span>
              </div>
              {mappedSearchResults.map((user) => (
                <ConversationRow
                  key={user.conversationId}
                  user={user}
                  selected={user.conversationId === activeConversationId}
                  onSelect={() => {
                    setActiveConversationId(user.conversationId);
                    setSearchQuery("");
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Groups Panel */}
        <TabsContent value="groups" className="flex-1 overflow-x-hidden overflow-y-auto outline-none p-2 space-y-2 pb-20 lg:pb-2">
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
              <div key={group.id} className="group relative">
                <ConversationRow
                  user={group}
                  selected={group.id === activeConversationId}
                  onSelect={() => setActiveGroup(groups.find((g) => g._id === group.id))}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArchiveConversation(group.id);
                  }}
                  title="Archive Group"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:block rounded-lg p-1.5 bg-surface/90 text-muted hover:text-accent shadow"
                >
                  <ArchiveIcon className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </TabsContent>

        {/* Users / People Panel */}
        <TabsContent value="users" className="flex-1 overflow-x-hidden overflow-y-auto outline-none pb-20 lg:pb-2">
          {isSearchingUsers ? (
            <p className="px-4 py-6 text-center text-xs text-muted">Searching users by username/email...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {normalizedSearchQuery ? "No users found matching your search." : "No recent users yet. Search above by username!"}
            </p>
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

      {/* Bottom User Profile Card (Desktop Only) */}
      <div className="hidden lg:flex shrink-0 border-t border-border bg-surface/40 p-2.5 items-center justify-between">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
        >
          <div className="relative shrink-0">
            <Avatar className="size-9 border border-border group-hover:border-accent transition">
              <AvatarImage src={authUser?.profilePic} alt={authUser?.fullName} />
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(authUser?.fullName || "Me")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold truncate group-hover:text-accent transition">
              {authUser?.fullName}
            </span>
            <span className="text-[10px] text-muted truncate">
              {authUser?.bio || authUser?.email}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsProfileOpen(true)}
          title="Account Settings"
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground transition shrink-0"
        >
          <SettingsIcon className="size-4" />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenProfile={() => setIsProfileOpen(true)} />
    </aside>
  );
}

export default ChatSidebar;
