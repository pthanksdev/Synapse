import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { axiosInstance } from "../../lib/axios";
import { FileIcon, ImageIcon, VideoIcon, XIcon, DownloadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

export function SharedMediaDrawer({ isOpen, onClose }) {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const setActiveLightboxMedia = useChatStore((state) => state.setActiveLightboxMedia);
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("media");

  useEffect(() => {
    if (isOpen && activeConversationId) {
      setIsLoading(true);
      axiosInstance
        .get(`/messages/media/${activeConversationId}`)
        .then((res) => setMediaList(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, activeConversationId]);

  if (!isOpen || !activeConversation) return null;

  const imagesAndVideos = mediaList.filter((m) => m.type === "image" || m.type === "video");
  const files = mediaList.filter((m) => m.type === "file" || m.type === "audio");

  return (
    <div className="absolute right-0 top-0 bottom-0 z-40 w-80 bg-background/95 backdrop-blur-md border-l border-border flex flex-col shadow-2xl transition-all animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Shared Media & Details</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground transition"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* Peer Profile Card */}
      <div className="p-4 border-b border-border flex flex-col items-center text-center bg-surface/30">
        <Avatar className="size-16 mb-2">
          <AvatarImage src={activeConversation.peer.avatarUrl} />
          <AvatarFallback className="text-lg">{activeConversation.peer.initials}</AvatarFallback>
        </Avatar>
        <h4 className="font-bold text-base">{activeConversation.peer.name}</h4>
        <p className="text-xs text-muted mt-0.5">{activeConversation.peer.subtitle}</p>
      </div>

      {/* Tabs for Media / Files */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b border-border px-3 py-2">
          <TabsList className="w-full flex">
            <TabsTrigger value="media" className="flex-1 justify-center gap-1 text-xs">
              <ImageIcon className="size-3.5" /> Media ({imagesAndVideos.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="flex-1 justify-center gap-1 text-xs">
              <FileIcon className="size-3.5" /> Files ({files.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Media Panel */}
        <TabsContent value="media" className="flex-1 overflow-y-auto p-3 outline-none">
          {isLoading ? (
            <p className="text-center text-xs text-muted py-6">Loading shared media...</p>
          ) : imagesAndVideos.length === 0 ? (
            <p className="text-center text-xs text-muted py-6">No photos or videos shared yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {imagesAndVideos.map((m) => (
                <button
                  key={m._id}
                  onClick={() =>
                    setActiveLightboxMedia({
                      url: m.image || m.video,
                      type: m.type,
                    })
                  }
                  className="aspect-square relative group overflow-hidden rounded-lg bg-surface border border-border/50"
                >
                  {m.type === "image" ? (
                    <img src={m.image} alt="" className="size-full object-cover group-hover:scale-105 transition duration-200" />
                  ) : (
                    <div className="size-full bg-black/40 flex items-center justify-center">
                      <VideoIcon className="size-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Files Panel */}
        <TabsContent value="files" className="flex-1 overflow-y-auto p-3 outline-none space-y-2">
          {isLoading ? (
            <p className="text-center text-xs text-muted py-6">Loading shared files...</p>
          ) : files.length === 0 ? (
            <p className="text-center text-xs text-muted py-6">No documents or files shared yet.</p>
          ) : (
            files.map((f) => (
              <a
                key={f._id}
                href={f.fileUrl || f.audio}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-surface/50 hover:bg-surface transition group"
              >
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate group-hover:text-primary transition">
                    {f.fileName || (f.audio ? "Voice Note.webm" : "Document")}
                  </p>
                  <p className="text-[10px] text-muted">
                    {f.fileSize ? `${(f.fileSize / 1024 / 1024).toFixed(2)} MB` : "File"}
                  </p>
                </div>
                <DownloadIcon className="size-4 text-muted group-hover:text-foreground shrink-0" />
              </a>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
