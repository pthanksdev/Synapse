import { useEffect } from "react";
import useScrollToBottom from "../../hooks/useScrollToBottom";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const loadMoreMessages = useChatStore((state) => state.loadMoreMessages);
  const hasMoreMessages = useChatStore((state) => state.hasMoreMessages);
  const isFetchingMore = useChatStore((state) => state.isFetchingMore);

  const lastMessageId = activeConversation?.messages.at(-1)?.id;
  const messagesScrollRef = useScrollToBottom(activeConversationId, lastMessageId);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          {hasMoreMessages && activeConversation.messages.length >= 50 && (
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMoreMessages} 
                disabled={isFetchingMore}
                className="text-xs font-semibold rounded-full"
              >
                {isFetchingMore ? (
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                ) : (
                  "Load Previous Messages"
                )}
              </Button>
            </div>
          )}
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            Today
          </p>
          {activeConversation.messages.map((message) => (
            <MessageBubble key={message.id || message._id} message={message} />
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}
