import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { SendIcon, XIcon, CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

export function ForwardMessageModal({ isOpen, message, onClose }) {
  const users = useChatStore((state) => state.users);
  const groups = useChatStore((state) => state.groups);

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !message) return null;

  const toggleUserSelect = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleGroupSelect = (id) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleForward = async () => {
    if (selectedUserIds.length === 0 && selectedGroupIds.length === 0) {
      return toast.error("Please select at least one target recipient or group");
    }

    setIsSending(true);
    try {
      await axiosInstance.post("/messages/forward", {
        messageId: message._id || message.id,
        targetUserIds: selectedUserIds,
        targetGroupIds: selectedGroupIds,
      });
      toast.success("Message forwarded!");
      onClose();
    } catch (error) {
      toast.error("Failed to forward message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <SendIcon className="size-4 text-accent" /> Forward Message
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="bg-surface/50 p-2.5 rounded-xl border border-border text-xs italic text-muted shrink-0">
          "{message.text || "Media Attachment"}"
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Direct Messages Target */}
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">People</span>
            <div className="space-y-1">
              {users.map((u) => {
                const isSelected = selectedUserIds.includes(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => toggleUserSelect(u._id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition ${
                      isSelected ? "bg-accent/15 text-accent font-semibold" : "hover:bg-surface/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarImage src={u.profilePic} />
                        <AvatarFallback>{u.fullName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{u.fullName}</span>
                    </div>
                    {isSelected && <CheckIcon className="size-4 text-accent" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Groups Target */}
          {groups.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">Groups</span>
              <div className="space-y-1">
                {groups.map((g) => {
                  const isSelected = selectedGroupIds.includes(g._id);
                  return (
                    <button
                      key={g._id}
                      onClick={() => toggleGroupSelect(g._id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition ${
                        isSelected ? "bg-accent/15 text-accent font-semibold" : "hover:bg-surface/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-accent/40">
                          <AvatarImage src={g.avatar} />
                          <AvatarFallback>{g.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{g.name}</span>
                      </div>
                      {isSelected && <CheckIcon className="size-4 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={isSending} onClick={handleForward}>
            {isSending ? "Forwarding..." : `Forward (${selectedUserIds.length + selectedGroupIds.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
