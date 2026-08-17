import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../../lib/axios";
import { ShieldCheckIcon, UserMinusIcon, XIcon, Edit3Icon, Share2Icon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";

export function GroupDetailsDrawer({ isOpen, onClose }) {
  const activeGroup = useChatStore((state) => state.activeGroup);
  const getGroups = useChatStore((state) => state.getGroups);
  const authUser = useAuthStore((state) => state.authUser);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeGroup?.name || "");
  const [description, setDescription] = useState(activeGroup?.description || "");

  if (!isOpen || !activeGroup) return null;

  const isAdmin = activeGroup.adminIds?.some(
    (admin) => (admin._id || admin).toString() === authUser?._id.toString()
  );

  const handleUpdateGroup = async () => {
    try {
      await axiosInstance.put(`/groups/${activeGroup._id}`, { name, description });
      toast.success("Group details updated");
      setIsEditing(false);
      getGroups();
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await axiosInstance.post(`/groups/${activeGroup._id}/admin/${userId}`);
      toast.success("Admin roles updated");
      getGroups();
    } catch (error) {
      toast.error("Failed to update admin role");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axiosInstance.delete(`/groups/${activeGroup._id}/members/${userId}`);
      toast.success("Member removed");
      getGroups();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/group/${activeGroup.inviteCode || activeGroup._id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Group invite link copied to clipboard!");
  };

  const handleResetInviteCode = async () => {
    try {
      await axiosInstance.post(`/groups/${activeGroup._id}/invite-code`);
      toast.success("New group invite code generated");
      getGroups();
    } catch (error) {
      toast.error("Failed to reset invite code");
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 z-40 w-80 bg-background/95 backdrop-blur-md border-l border-border flex flex-col shadow-2xl transition-all animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Group Details</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground">
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="p-4 border-b border-border flex flex-col items-center text-center bg-surface/30">
        <Avatar className="size-20 mb-3 border-2 border-accent">
          <AvatarImage src={activeGroup.avatar} />
          <AvatarFallback className="text-xl font-bold">{activeGroup.name?.[0]}</AvatarFallback>
        </Avatar>

        {isEditing ? (
          <div className="w-full space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group Name" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <Button variant="primary" className="w-full" onPress={handleUpdateGroup}>
              Save Changes
            </Button>
          </div>
        ) : (
          <>
            <h4 className="font-bold text-lg">{activeGroup.name}</h4>
            <p className="text-xs text-muted mt-1">{activeGroup.description || "No description set"}</p>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-accent" onPress={() => setIsEditing(true)}>
                <Edit3Icon className="size-3.5 mr-1" /> Edit Group Info
              </Button>
            )}
          </>
        )}
      </div>

      {/* Invite Link Section */}
      <div className="p-3 border-b border-border bg-surface/20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold flex items-center gap-1">
            <Share2Icon className="size-3.5 text-accent" /> Group Invite Link
          </span>
          {isAdmin && (
            <button onClick={handleResetInviteCode} title="Revoke & Reset Code" className="text-muted hover:text-foreground">
              <RefreshCwIcon className="size-3" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          <Input
            readOnly
            value={`${window.location.origin}/join/group/${activeGroup.inviteCode || activeGroup._id}`}
            className="text-[10px] h-8 font-mono bg-surface"
          />
          <Button variant="secondary" size="sm" className="h-8 text-xs shrink-0" onClick={handleCopyInviteLink}>
            <CopyIcon className="size-3 mr-1" /> Copy
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h5 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Group Members ({activeGroup.memberIds?.length || 0})
        </h5>

        <div className="space-y-2">
          {activeGroup.memberIds?.map((member) => {
            const memberIsAdmin = activeGroup.adminIds?.some(
              (a) => (a._id || a).toString() === (member._id || member).toString()
            );

            return (
              <div
                key={member._id || member}
                className="flex items-center justify-between p-2 rounded-xl border border-border/50 bg-surface/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={member.profilePic} />
                    <AvatarFallback>{member.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{member.fullName}</p>
                    {memberIsAdmin && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent font-medium">
                        <ShieldCheckIcon className="size-3" /> Admin
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (member._id || member).toString() !== authUser?._id.toString() && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleAdmin(member._id || member)}
                      title={memberIsAdmin ? "Demote from Admin" : "Make Admin"}
                      className="p-1 rounded text-muted hover:text-accent"
                    >
                      <ShieldCheckIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member._id || member)}
                      title="Remove from group"
                      className="p-1 rounded text-muted hover:text-red-500"
                    >
                      <UserMinusIcon className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
