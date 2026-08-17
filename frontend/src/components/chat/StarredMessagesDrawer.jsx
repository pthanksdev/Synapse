import { useEffect, useState } from "react";
import { StarIcon, XIcon, MessageSquareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { axiosInstance } from "../../lib/axios";

export function StarredMessagesDrawer({ isOpen, onClose }) {
  const [starredMessages, setStarredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      axiosInstance
        .get("/messages/starred")
        .then((res) => setStarredMessages(res.data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <div className="flex items-center gap-2 font-bold text-sm">
          <StarIcon className="size-4 text-amber-400 fill-amber-400" /> Starred Messages
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {isLoading ? (
          <p className="text-center text-xs text-muted py-8">Loading starred messages...</p>
        ) : starredMessages.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <StarIcon className="size-8 text-muted mx-auto opacity-50" />
            <p className="text-xs text-muted">No starred messages yet.</p>
          </div>
        ) : (
          starredMessages.map((msg) => (
            <div key={msg._id} className="p-3 rounded-2xl border border-border bg-surface/30 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={msg.senderId?.profilePic} />
                  <AvatarFallback>{msg.senderId?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">{msg.senderId?.fullName}</span>
                <span className="text-[10px] text-muted ml-auto">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-foreground/90 pl-8">{msg.text || "Attachment"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
