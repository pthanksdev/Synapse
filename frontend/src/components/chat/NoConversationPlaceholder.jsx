import { MessageSquarePlusIcon, UserPlusIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { Button } from "../ui/button";

export function NoConversationPlaceholder() {
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  return (
    <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:gap-5 sm:px-8 sm:py-16">
      <div
        className="flex size-20 items-center justify-center rounded-3xl bg-accent/10 border border-accent/20 shadow-inner"
        aria-hidden
      >
        <MessageSquarePlusIcon className="size-10 text-accent" strokeWidth={1.5} />
      </div>
      <div className="max-w-xs space-y-2">
        <h2 className="text-lg font-bold tracking-tight">
          No Chat Selected
        </h2>
        <p className="text-xs leading-relaxed text-muted">
          Select an existing chat from the left sidebar or search for users to start messaging!
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setSidebarTab("users")}
        className="mt-1 text-xs font-semibold rounded-xl"
      >
        <UserPlusIcon className="size-4 mr-2" /> Find People to Message
      </Button>
    </div>
  );
}
