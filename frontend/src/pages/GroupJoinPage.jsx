import { useEffect } from "react";
import { useParams, useNavigate } from "react";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

export default function GroupJoinPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const getGroups = useChatStore((state) => state.getGroups);
  const setActiveGroup = useChatStore((state) => state.setActiveGroup);

  useEffect(() => {
    async function joinGroup() {
      try {
        const res = await axiosInstance.post(`/groups/join/${inviteCode}`);
        toast.success(`Joined group: ${res.data.name}!`);
        await getGroups();
        setActiveGroup(res.data);
        navigate("/");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to join group via invite link");
        navigate("/");
      }
    }
    if (inviteCode) joinGroup();
  }, [inviteCode, navigate, getGroups, setActiveGroup]);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="font-semibold">Joining group chat via invite link...</p>
      </div>
    </div>
  );
}
