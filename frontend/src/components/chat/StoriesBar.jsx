import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlusIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

export function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const authUser = useAuthStore((state) => state.authUser);

  const fetchStories = async () => {
    try {
      const res = await axiosInstance.get("/stories");
      setStories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUploadStory = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    setIsUploading(true);
    try {
      await axiosInstance.post("/stories", formData);
      toast.success("Story posted!");
      fetchStories();
    } catch (error) {
      toast.error("Failed to upload story");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full border-b border-border/60 bg-surface/20 p-2.5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadStory}
        accept="image/*,video/*"
        className="hidden"
      />

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* Post Story Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 shrink-0 group"
          disabled={isUploading}
        >
          <div className="relative size-12 rounded-full border-2 border-dashed border-accent flex items-center justify-center bg-accent/10 group-hover:scale-105 transition">
            <Avatar className="size-10">
              <AvatarImage src={authUser?.profilePic} />
              <AvatarFallback>{authUser?.fullName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow">
              <PlusIcon className="size-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-muted truncate max-w-[56px]">
            {isUploading ? "Posting..." : "Your Story"}
          </span>
        </button>

        {/* Stories List */}
        {stories.map((story) => (
          <button
            key={story._id}
            onClick={() => setActiveStory(story)}
            className="flex flex-col items-center gap-1 shrink-0 group"
          >
            <div className="size-12 rounded-full p-0.5 bg-gradient-to-tr from-accent via-purple-500 to-pink-500 group-hover:scale-105 transition">
              <Avatar className="size-full border-2 border-background">
                <AvatarImage src={story.userId?.profilePic} />
                <AvatarFallback>{story.userId?.fullName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[10px] font-medium text-foreground truncate max-w-[56px]">
              {story.userId?.fullName?.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Story View Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 z-20 size-8 rounded-full bg-black/50 text-white flex items-center justify-center"
            >
              <XIcon className="size-5" />
            </button>

            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <Avatar className="size-8 border border-white/20">
                <AvatarImage src={activeStory.userId?.profilePic} />
                <AvatarFallback>{activeStory.userId?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold text-xs drop-shadow">
                {activeStory.userId?.fullName}
              </span>
            </div>

            <img
              src={activeStory.mediaUrl}
              alt="Story"
              className="size-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
