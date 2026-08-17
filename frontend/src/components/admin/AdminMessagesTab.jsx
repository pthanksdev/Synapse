import { Trash2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AdminMessagesTab({ messages, searchMsg, setSearchMsg, fetchMessages, handleDeleteMessage }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search global message contents..."
          value={searchMsg}
          onChange={(e) => setSearchMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMessages()}
          className="max-w-md"
        />
        <Button variant="secondary" onClick={fetchMessages}>
          Search
        </Button>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <div
            key={m._id}
            className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={m.senderId?.profilePic} />
                <AvatarFallback>{m.senderId?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">
                  {m.senderId?.fullName} <span className="text-muted font-normal">→</span>{" "}
                  {m.receiverId?.fullName || "Group"}
                </div>
                <p className="text-muted mt-0.5 italic">"{m.text || "Media Message"}"</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(m._id)}>
              <Trash2Icon className="size-3 mr-1" /> Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
