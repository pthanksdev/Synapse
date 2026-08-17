import { useEffect, useState } from "react";
import { UsersIcon, XIcon, CheckIcon } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get("/users/sidebar").then((res) => setContacts(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMemberSelection = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) return toast.error("Please enter a group name");
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/groups", {
        name,
        description,
        memberIds: selectedMemberIds,
      });
      toast.success("Group created successfully!");
      onGroupCreated(res.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <UsersIcon className="size-5 text-accent" /> Create New Group
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Group Name (e.g. Design Team)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Member Selector List */}
        <div>
          <label className="text-xs font-semibold text-muted mb-2 block">
            Select Members ({selectedMemberIds.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-border rounded-xl p-2 bg-surface/30">
            {contacts.map((user) => {
              const isSelected = selectedMemberIds.includes(user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleMemberSelection(user._id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border transition ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-transparent hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage src={user.profilePic} />
                      <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{user.fullName}</span>
                  </div>
                  {isSelected && <CheckIcon className="size-4 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          className="w-full font-semibold mt-2"
          variant="primary"
          disabled={!name.trim() || isLoading}
          onClick={handleCreateGroup}
        >
          {isLoading ? "Creating Group..." : "Create Group Chat"}
        </Button>
      </div>
    </div>
  );
}
