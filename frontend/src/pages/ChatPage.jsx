import ChatArea from "../components/chat/ChatArea";
import ChatSidebar from "../components/chat/ChatSidebar";
import { MediaLightbox } from "../components/chat/MediaLightbox";
import { VideoCallModal } from "../components/chat/VideoCallModal";
import { IncomingCallOverlay } from "../components/chat/IncomingCallOverlay";
import { useCallStore } from "../store/useCallStore";
import { useEffect } from "react";
import { useWallpaper } from "../context/wallpaper";

export default function ChatPage() {
  const initCallListeners = useCallStore((state) => state.initCallListeners);
  const removeCallListeners = useCallStore((state) => state.removeCallListeners);
  const { frameStyle } = useWallpaper();

  useEffect(() => {
    initCallListeners();
    return () => removeCallListeners();
  }, [initCallListeners, removeCallListeners]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground" style={frameStyle}>
      <ChatSidebar />
      <ChatArea />
      <MediaLightbox />
      
      {/* WebRTC Calling Modals */}
      <VideoCallModal />
      <IncomingCallOverlay />
    </div>
  );
}
