import { useEffect, useRef } from "react";
import { useCallStore } from "../../store/useCallStore";
import { MicOffIcon, PhoneOffIcon, VideoOffIcon, MonitorIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function VideoCallModal() {
  const { isInCall, isVideo, localStream, remoteStream, endCall, toggleScreenShare, isScreenSharing } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isInCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden bg-background border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 text-xs font-bold animate-pulse flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-red-500" /> {isScreenSharing ? "Screen Sharing" : "FaceTime Video"}
            </div>
          </div>
        </div>

        {/* Remote Video (Main) */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`size-full ${isVideo ? "object-cover" : "hidden"}`}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/60 animate-pulse">
              <Avatar className="size-24 border-2 border-white/20">
                <AvatarFallback className="text-2xl font-bold bg-white/10 text-white">?</AvatarFallback>
              </Avatar>
              <p>Connecting to peer...</p>
            </div>
          )}

          {!isVideo && remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Avatar className="size-32 border-4 border-accent shadow-2xl shadow-accent/20 mb-4 animate-pulse">
                <AvatarFallback className="text-3xl font-bold">Audio</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white">In Call</h2>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute bottom-24 right-6 w-32 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`size-full ${isVideo ? "object-cover" : "hidden"}`}
          />
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4 z-10">
          <Button isIconOnly size="lg" className="rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10">
            <MicOffIcon className="size-5" />
          </Button>

          {isVideo && (
            <Button
              isIconOnly
              size="lg"
              onPress={toggleScreenShare}
              className={`rounded-full backdrop-blur-md border transition ${
                isScreenSharing
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-white/10 text-white hover:bg-white/20 border-white/10"
              }`}
            >
              <MonitorIcon className="size-5" />
            </Button>
          )}

          <Button isIconOnly size="lg" onPress={endCall} className="rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 border border-red-400">
            <PhoneOffIcon className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
