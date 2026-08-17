import { PhoneIcon, PhoneOffIcon, VideoIcon } from "lucide-react";
import { useCallStore } from "../../store/useCallStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function IncomingCallOverlay() {
  const { isRinging, incomingCall, acceptCall, rejectCall } = useCallStore();

  if (!isRinging || !incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col items-center justify-center space-y-8 p-8 rounded-3xl bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="size-24 border-4 border-accent shadow-xl shadow-accent/20 animate-pulse">
            <AvatarImage src={incomingCall.callerData?.profilePic} />
            <AvatarFallback className="text-3xl font-bold bg-accent text-accent-foreground">
              {incomingCall.callerData?.fullName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold">{incomingCall.callerData?.fullName}</h2>
            <p className="text-muted mt-1">
              Incoming {incomingCall.isVideo ? "FaceTime Video" : "Audio"} Call...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 mt-4">
          <button
            onClick={rejectCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:bg-red-600 group-active:scale-95 transition-all">
              <PhoneOffIcon className="size-7 text-white" />
            </div>
            <span className="text-xs font-semibold text-red-500">Decline</span>
          </button>

          <button
            onClick={acceptCall}
            className="flex flex-col items-center gap-2 group animate-bounce"
          >
            <div className="size-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:bg-green-600 group-active:scale-95 transition-all">
              {incomingCall.isVideo ? (
                <VideoIcon className="size-7 text-white" />
              ) : (
                <PhoneIcon className="size-7 text-white" />
              )}
            </div>
            <span className="text-xs font-semibold text-green-500">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
