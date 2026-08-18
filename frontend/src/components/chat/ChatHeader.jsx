import { useState } from "react";
import { ChevronLeftIcon, InfoIcon, Volume2Icon, VolumeXIcon, XIcon, PhoneIcon, VideoIcon, ShieldCheckIcon, SearchIcon } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

import { ThemeToggle } from "../ThemeToggle";

import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useCallStore } from "../../store/useCallStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function ChatHeader({ onToggleDrawer }) {
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setSoundEnabled = useChatStore((state) => state.setSoundEnabled);
  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const [isSearching, setIsSearching] = useState(false);

  const initiateCall = useCallStore((state) => state.initiateCall);

  const typingUsers = useAuthStore((state) => state.typingUsers);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  const isPeerTyping = activeConversationId ? Boolean(typingUsers[activeConversationId]) : false;

  return (
    <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2 bg-background/95 backdrop-blur-md">
      {activeConversation && !isLargeScreen ? (
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          className="shrink-0"
          onClick={() => setActiveConversationId(null)}
        >
          <ChevronLeftIcon className="size-6" strokeWidth={2.25} />
        </Button>
      ) : null}

      {activeConversation ? (
        <>
          <AvatarWithOnlineIndicator isOnline={activeConversation.peer.isOnline ?? true}>
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                alt={activeConversation.peer.name}
                src={activeConversation.peer.avatarUrl}
              />
              <AvatarFallback className="text-sm font-medium">
                {activeConversation.peer.initials}
              </AvatarFallback>
            </Avatar>
          </AvatarWithOnlineIndicator>

          <div className="flex-1 text-center sm:text-left min-w-0">
            {isSearching ? (
              <div className="relative max-w-xs">
                <Input
                  autoFocus
                  placeholder="Filter chat history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs pr-7"
                />
                <button
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-2 top-2 text-muted hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <p className="truncate text-[15px] font-semibold leading-tight flex items-center gap-1.5 justify-center sm:justify-start">
                  {activeConversation.peer.name}
                  <span title="E2EE Signal Encrypted" className="text-emerald-500">
                    <ShieldCheckIcon className="size-3.5 inline" />
                  </span>
                </p>
                <p className="truncate text-xs text-muted">
                  {isPeerTyping ? (
                    <span className="font-medium animate-pulse text-accent">typing...</span>
                  ) : activeConversation.peer.isOnline ? (
                    <span className="font-medium text-emerald-500">Online • End-to-End Encrypted</span>
                  ) : (
                    "Offline"
                  )}
                </p>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center gap-2.5 sm:text-left">
          <AppLogo size={36} className="rounded-[9px]" />
          <div className="flex-1 text-center sm:text-left">
            <p className="truncate text-[13px] font-medium text-muted">Select a conversation</p>
          </div>
        </div>
      )}

      <div className="ml-auto flex max-w-full shrink-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1">
        {activeConversation && (
          <div className="flex items-center gap-0.5 mr-2">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onClick={() => setIsSearching(!isSearching)}
              title="Search in chat"
              className={isSearching ? "text-accent bg-accent/10" : "text-muted"}
            >
              <SearchIcon className="size-4.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="text-accent"
              aria-label="Audio Call"
              onClick={() => initiateCall(activeConversationId, activeConversation.peer, false)}
            >
              <PhoneIcon className="size-4.5" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="text-accent"
              aria-label="Video Call"
              onClick={() => initiateCall(activeConversationId, activeConversation.peer, true)}
            >
              <VideoIcon className="size-5" strokeWidth={2} />
            </Button>
          </div>
        )}

        <ThemeToggle />

        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          className="shrink-0 hidden sm:flex"
          aria-pressed={isSoundEnabled}
          onClick={() => setSoundEnabled(!isSoundEnabled)}
        >
          {isSoundEnabled ? (
            <Volume2Icon className="size-5.5" strokeWidth={2} aria-hidden />
          ) : (
            <VolumeXIcon className="size-5.5" strokeWidth={2} aria-hidden />
          )}
        </Button>

        {activeConversation ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="shrink-0"
              aria-label="Shared media and details"
              onClick={onToggleDrawer}
            >
              <InfoIcon className="size-5" strokeWidth={2} aria-hidden />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="shrink-0"
              aria-label="Close chat"
              onClick={() => setActiveConversationId(null)}
            >
              <XIcon className="size-5.5" strokeWidth={2} aria-hidden />
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}
