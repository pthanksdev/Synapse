import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  PlusIcon,
  XIcon,
  Trash2Icon,
  TypeIcon,
  ImageIcon,
  SparklesIcon,
  SendIcon,
  RotateCwIcon,
  FlipHorizontalIcon,
  Volume2Icon,
  VolumeXIcon,
  CropIcon,
  Wand2Icon,
  MessageSquareIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

const GRADIENT_PRESETS = [
  { id: "purple", label: "Purple Glow", value: "from-indigo-600 via-purple-600 to-pink-600" },
  { id: "sunset", label: "Sunset Fire", value: "from-pink-500 via-red-500 to-amber-500" },
  { id: "emerald", label: "Emerald Bay", value: "from-emerald-500 via-teal-600 to-cyan-700" },
  { id: "ocean", label: "Deep Ocean", value: "from-blue-600 via-indigo-700 to-purple-800" },
  { id: "fire", label: "Amber Pulse", value: "from-amber-400 via-orange-500 to-red-600" },
  { id: "midnight", label: "Midnight", value: "from-zinc-900 via-slate-900 to-black" },
  { id: "neon", label: "Neon Cyber", value: "from-fuchsia-600 via-purple-600 to-cyan-500" },
  { id: "cyberpunk", label: "Cyberpunk", value: "from-yellow-400 via-pink-500 to-purple-600" },
  { id: "aurora", label: "Aurora Borealis", value: "from-green-400 via-cyan-500 to-blue-600" },
  { id: "candy", label: "Cotton Candy", value: "from-pink-400 via-purple-400 to-indigo-500" },
  { id: "rosegold", label: "Rose Gold", value: "from-rose-400 via-fuchsia-500 to-indigo-600" },
  { id: "citrus", label: "Neon Citrus", value: "from-lime-400 via-emerald-500 to-teal-600" },
  { id: "lavender", label: "Royal Lavender", value: "from-violet-500 via-purple-500 to-pink-500" },
  { id: "volcano", label: "Volcano Lava", value: "from-red-600 via-orange-600 to-yellow-500" },
];

const IMAGE_FILTERS = [
  { id: "none", label: "Normal", filterCss: "none" },
  { id: "grayscale", label: "B&W", filterCss: "grayscale(100%)" },
  { id: "sepia", label: "Vintage", filterCss: "sepia(80%)" },
  { id: "vivid", label: "Vivid", filterCss: "contrast(130%) saturate(140%)" },
  { id: "warm", label: "Warm", filterCss: "sepia(30%) saturate(120%) hue-rotate(-10deg)" },
  { id: "cool", label: "Cool", filterCss: "saturate(110%) hue-rotate(15deg)" },
];

export function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Popover & Text Story Modal
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textStoryContent, setTextStoryContent] = useState("");
  const [selectedBg, setSelectedBg] = useState(GRADIENT_PRESETS[0].value);

  // Media Story Editor Modal
  const [selectedMedia, setSelectedMedia] = useState(null); // { file, url, isVideo }
  const [isMediaEditorOpen, setIsMediaEditorOpen] = useState(false);
  const [fitMode, setFitMode] = useState("cover"); // "cover" | "contain"
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [mediaCaption, setMediaCaption] = useState("");

  // Local audio override in story viewer
  const [viewerMuted, setViewerMuted] = useState(false);

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

  const handleDeleteStory = async (storyId) => {
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      toast.success("Story deleted");
      setActiveStory(null);
      fetchStories();
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleSelectMediaFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type ? file.type.startsWith("video") : false;
    const url = URL.createObjectURL(file);

    setSelectedMedia({ file, url, isVideo });
    setFitMode("cover");
    setRotation(0);
    setIsFlipped(false);
    setSelectedFilter(IMAGE_FILTERS[0]);
    setIsMuted(false);
    setMediaCaption("");
    setIsChoiceOpen(false);
    setIsMediaEditorOpen(true);

    // Reset file input value
    e.target.value = "";
  };

  // Canvas processing for image crop/rotate/filter export
  const processImageCanvas = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedMedia.url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Target story dimensions 1080 x 1920 (9:16 ratio)
        const targetW = 1080;
        const targetH = 1920;

        canvas.width = targetW;
        canvas.height = targetH;

        // Background fill for contain mode
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, targetW, targetH);

        // Apply filter
        ctx.filter = selectedFilter.filterCss;

        ctx.save();
        ctx.translate(targetW / 2, targetH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(isFlipped ? -1 : 1, 1);

        const isRotated90 = rotation % 180 !== 0;
        const srcW = isRotated90 ? img.height : img.width;
        const srcH = isRotated90 ? img.width : img.height;

        let drawW, drawH;
        if (fitMode === "contain") {
          const scale = Math.min(targetW / srcW, targetH / srcH);
          drawW = img.width * scale;
          drawH = img.height * scale;
        } else {
          // Cover mode
          const scale = Math.max(targetW / srcW, targetH / srcH);
          drawW = img.width * scale;
          drawH = img.height * scale;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Render caption text onto canvas if provided
        if (mediaCaption.trim()) {
          ctx.font = "bold 44px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 12;
          ctx.fillText(mediaCaption.trim(), targetW / 2, targetH - 120);
        }

        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
      };
    });
  };

  const handlePostMediaStory = async () => {
    if (!selectedMedia) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("caption", mediaCaption);
      formData.append("fitMode", fitMode);

      if (selectedMedia.isVideo) {
        formData.append("media", selectedMedia.file);
        formData.append("mediaType", "video");
        formData.append("isMuted", isMuted ? "true" : "false");
      } else {
        // Process image with canvas
        const blob = await processImageCanvas();
        formData.append("media", blob, "story_edited.jpg");
        formData.append("mediaType", "image");
        formData.append("isMuted", "false");
      }

      await axiosInstance.post("/stories", formData);
      toast.success("Story posted!");
      setIsMediaEditorOpen(false);
      setSelectedMedia(null);
      fetchStories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post media story");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostTextStory = async () => {
    if (!textStoryContent.trim()) {
      toast.error("Please type something for your story!");
      return;
    }

    setIsUploading(true);
    try {
      await axiosInstance.post("/stories", {
        type: "text",
        text: textStoryContent.trim(),
        bgColor: selectedBg,
      });
      toast.success("Text story posted!");
      setIsTextModalOpen(false);
      setTextStoryContent("");
      fetchStories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post text story");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full border-b border-border/60 bg-surface/20 p-2.5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelectMediaFile}
        accept="image/*,video/*"
        className="hidden"
      />

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* Post Story Button (Regular Users Only) */}
        {authUser?.role !== "admin" && (
          <div className="relative shrink-0">
            <button
              onClick={() => setIsChoiceOpen(!isChoiceOpen)}
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

            {/* Story Type Choice Popup Modal */}
            {isChoiceOpen &&
              createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
                  <div className="relative w-full max-w-xs rounded-3xl border border-border bg-background p-5 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <h3 className="text-sm font-bold text-foreground">Create Story</h3>
                      <button
                        onClick={() => setIsChoiceOpen(false)}
                        className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground transition"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          setIsChoiceOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface/40 p-3 text-left hover:bg-surface hover:border-accent/40 transition group"
                      >
                        <div className="size-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center group-hover:scale-105 transition shrink-0">
                          <ImageIcon className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">Photo or Video</span>
                          <span className="text-[10px] text-muted">Upload and edit media stories</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsChoiceOpen(false);
                          setIsTextModalOpen(true);
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface/40 p-3 text-left hover:bg-surface hover:border-purple-500/40 transition group"
                      >
                        <div className="size-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                          <TypeIcon className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">Text Story</span>
                          <span className="text-[10px] text-muted">Type text with colors & gradients</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>
        )}

        {/* Stories List */}
        {stories.map((story) => (
          <button
            key={story._id}
            onClick={() => {
              setActiveStory(story);
              setViewerMuted(story.isMuted);
            }}
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

      {/* Media Story Editor Modal Portal */}
      {isMediaEditorOpen && selectedMedia &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#1c1c1e] p-5 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Wand2Icon className="size-5 text-accent" />
                  <h3 className="text-base font-bold text-white">
                    Edit {selectedMedia.isVideo ? "Video" : "Photo"} Story
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsMediaEditorOpen(false);
                    setSelectedMedia(null);
                  }}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              {/* Story Editor Preview Box */}
              <div className="relative aspect-[9/16] max-h-80 w-full rounded-2xl bg-black overflow-hidden border border-white/20 flex items-center justify-center">
                {selectedMedia.isVideo ? (
                  <video
                    src={selectedMedia.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className={`size-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt="Preview"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                      filter: selectedFilter.filterCss,
                    }}
                    className={`size-full transition-transform duration-200 ${
                      fitMode === "contain" ? "object-contain" : "object-cover"
                    }`}
                  />
                )}

                {/* Caption overlay preview */}
                {mediaCaption.trim() && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="inline-block rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/10 drop-shadow">
                      {mediaCaption}
                    </span>
                  </div>
                )}
              </div>

              {/* Editing Controls */}
              <div className="space-y-3">
                {/* Aspect Fit & Crop Controls */}
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CropIcon className="size-4 text-accent" /> Fit Mode:
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFitMode("cover")}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        fitMode === "cover" ? "bg-accent text-accent-foreground shadow" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Fill 9:16
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode("contain")}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        fitMode === "contain" ? "bg-accent text-accent-foreground shadow" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Fit Whole
                    </button>
                  </div>
                </div>

                {/* Video Audio Mute Control */}
                {selectedMedia.isVideo && (
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      {isMuted ? <VolumeXIcon className="size-4 text-red-400" /> : <Volume2Icon className="size-4 text-green-400" />} Audio Track:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isMuted
                          ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                          : "bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30"
                      }`}
                    >
                      {isMuted ? <VolumeXIcon className="size-3.5" /> : <Volume2Icon className="size-3.5" />}
                      {isMuted ? "Audio Muted" : "Sound Enabled"}
                    </button>
                  </div>
                )}

                {/* Image Rotate & Flip Controls */}
                {!selectedMedia.isVideo && (
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-semibold">Transform:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
                      >
                        <RotateCwIcon className="size-3.5" /> 90°
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFlipped((prev) => !prev)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                          isFlipped ? "bg-accent text-accent-foreground" : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <FlipHorizontalIcon className="size-3.5" /> Flip
                      </button>
                    </div>
                  </div>
                )}

                {/* Filters for Image */}
                {!selectedMedia.isVideo && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Color Filter</label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {IMAGE_FILTERS.map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 border transition ${
                            selectedFilter.id === filter.id
                              ? "bg-accent text-accent-foreground border-accent shadow"
                              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                    <MessageSquareIcon className="size-3.5" /> Add Caption (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="Write a caption..."
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handlePostMediaStory}
                disabled={isUploading}
                className="w-full h-11 text-sm font-semibold gap-2"
              >
                <SendIcon className="size-4" /> {isUploading ? "Processing & Posting..." : "Post Story"}
              </Button>
            </div>
          </div>,
          document.body
        )}

      {/* Text Story Creation Modal Portal */}
      {isTextModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1e] p-6 shadow-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-5 text-accent" />
                  <h3 className="text-base font-bold text-white">Create Text Story</h3>
                </div>
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              {/* Story Live Preview Box */}
              <div className={`relative aspect-[9/16] max-h-72 w-full rounded-2xl bg-gradient-to-br ${selectedBg} p-6 flex items-center justify-center shadow-inner overflow-hidden border border-white/20`}>
                <p className="text-center font-bold text-white text-lg leading-snug drop-shadow break-words max-w-full">
                  {textStoryContent || "Type your story message here..."}
                </p>
              </div>

              {/* Gradient Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Background Color</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedBg(preset.value)}
                      className={`size-8 shrink-0 rounded-full bg-gradient-to-br ${preset.value} border-2 transition ${
                        selectedBg === preset.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  rows={3}
                  maxLength={250}
                  placeholder="What's on your mind? (Max 250 chars)"
                  value={textStoryContent}
                  onChange={(e) => setTextStoryContent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <div className="text-right text-[10px] text-zinc-500 mt-1">
                  {textStoryContent.length}/250
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handlePostTextStory}
                disabled={isUploading || !textStoryContent.trim()}
                className="w-full h-11 text-sm font-semibold gap-2"
              >
                <SendIcon className="size-4" /> {isUploading ? "Posting..." : "Post Story"}
              </Button>
            </div>
          </div>,
          document.body
        )}

      {/* Story View Modal (Portal to body) */}
      {activeStory &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col border border-white/10">
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {(activeStory.mediaType === "video" || activeStory.mediaUrl?.match(/\.(mp4|webm|mov)$/i)) && (
                  <button
                    onClick={() => setViewerMuted(!viewerMuted)}
                    title={viewerMuted ? "Unmute Sound" : "Mute Sound"}
                    className="size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition border border-white/20"
                  >
                    {viewerMuted ? <VolumeXIcon className="size-4 text-red-400" /> : <Volume2Icon className="size-4 text-green-400" />}
                  </button>
                )}
                {(activeStory.userId?._id === authUser?._id || activeStory.userId === authUser?._id || authUser?.role === "admin") && (
                  <button
                    onClick={() => handleDeleteStory(activeStory._id)}
                    title="Delete Story"
                    className="size-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition shadow"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveStory(null)}
                  className="size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition border border-white/20"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <Avatar className="size-8 border border-white/20">
                  <AvatarImage src={activeStory.userId?.profilePic} />
                  <AvatarFallback>{activeStory.userId?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-xs drop-shadow">
                    {activeStory.userId?.fullName}
                  </span>
                  <span className="text-[10px] text-white/70 drop-shadow flex items-center gap-1">
                    Story • 24h Expiry
                    {activeStory.isMuted && <span className="text-red-400">(Muted)</span>}
                  </span>
                </div>
              </div>

              {/* Story Content: Text vs Video vs Image */}
              {activeStory.type === "text" ? (
                <div className={`size-full bg-gradient-to-br ${activeStory.bgColor || "from-indigo-600 via-purple-600 to-pink-600"} flex items-center justify-center p-8 text-center`}>
                  <p className="text-white text-xl sm:text-2xl font-bold leading-relaxed drop-shadow-md break-words whitespace-pre-wrap">
                    {activeStory.text}
                  </p>
                </div>
              ) : activeStory.mediaType === "video" || activeStory.mediaUrl?.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  loop
                  muted={viewerMuted}
                  playsInline
                  className={`size-full ${activeStory.fitMode === "contain" ? "object-contain bg-black" : "object-cover"}`}
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt="Story"
                  className={`size-full ${activeStory.fitMode === "contain" ? "object-contain bg-black" : "object-cover"}`}
                />
              )}

              {/* Caption Overlay */}
              {activeStory.caption && (
                <div className="absolute bottom-6 left-4 right-4 z-20 text-center">
                  <span className="inline-block rounded-2xl bg-black/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/10 shadow-lg">
                    {activeStory.caption}
                  </span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
