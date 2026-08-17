import { ImageIcon, LoaderIcon, MicIcon, MapPinIcon, SendHorizontalIcon, SmileIcon, SquareIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { StickerPickerModal } from "./StickerPickerModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";

export default function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);

  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);

  const { activeConversationId } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);

  const socket = useAuthStore((state) => state.socket);

  const [isRecording, setIsRecording] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const typingTimeoutRef = useRef(null);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    if (socket && activeConversationId) {
      socket.emit("typing:stop", { receiverId: activeConversationId });
    }
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleSelectSticker = async (stickerUrl) => {
    await sendMessage({ image: stickerUrl });
  };

  // Ultra-Premium Feature: Share Live GPS Location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    toast.loading("Fetching GPS coordinates...", { id: "location" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        await sendMessage({ text: `📍 Shared Live Location: ${mapsUrl}` });
        toast.success("Live location shared!", { id: "location" });
      },
      (error) => {
        toast.error("Failed to acquire location permissions", { id: "location" });
      }
    );
  };

  const setDraft = useChatStore((state) => state.setDraft);

  const handleComposerTextChange = (event) => {
    const text = event.target.value;
    setComposerText(text);
    if (activeConversationId) setDraft(activeConversationId, text);
    playSoundIfEnabled();

    if (socket && activeConversationId) {
      socket.emit("typing:start", { receiverId: activeConversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { receiverId: activeConversationId });
      }, 2000);
    }
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const didSendMessage = await sendMediaMessage({
      conversationId: activeConversationId,
      file,
    });

    if (didSendMessage) playSoundIfEnabled();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `voice_note_${Date.now()}.webm`, { type: "audio/webm" });

        await sendMediaMessage({ conversationId: activeConversationId, file });
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start audio recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <footer className="relative shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2 bg-background">
      {replyingToMessage && (
        <div className="mx-auto mb-2 flex max-w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-muted">
          <div className="truncate">
            <span className="font-semibold text-foreground">Replying to: </span>
            <span className="italic">{replyingToMessage.text || "Media message"}</span>
          </div>
          <button
            onClick={() => setReplyingToMessage(null)}
            className="rounded-md p-1 hover:bg-background hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      <StickerPickerModal
        isOpen={isStickerPickerOpen}
        onClose={() => setIsStickerPickerOpen(false)}
        onSelectSticker={handleSelectSticker}
      />

      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon className="size-4 shrink-0 animate-spin text-accent" />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-full items-center gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.docx,.zip"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          onChange={handleMediaPick}
        />
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          className="size-9 shrink-0 text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <ImageIcon className="size-5" />
        </Button>

        <Button
          variant="ghost"
          isIconOnly
          className="size-9 shrink-0 text-accent"
          onPress={() => setIsStickerPickerOpen((prev) => !prev)}
        >
          <SmileIcon className="size-5" />
        </Button>

        <Button
          variant="ghost"
          isIconOnly
          className="size-9 shrink-0 text-accent"
          onPress={handleShareLocation}
          title="Share Live Location"
        >
          <MapPinIcon className="size-5" />
        </Button>

        {isRecording ? (
          <div className="flex flex-1 items-center justify-between rounded-full border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-500">
            <div className="flex items-center gap-2">
              <span className="font-medium animate-pulse">Recording voice note...</span>
              {/* Live Waveform Indicator */}
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-full bg-red-500 animate-pulse"></span>
                <span className="w-0.5 h-2 bg-red-500 animate-bounce delay-75"></span>
                <span className="w-0.5 h-3 bg-red-500 animate-bounce delay-150"></span>
                <span className="w-0.5 h-1.5 bg-red-500 animate-pulse"></span>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow"
            >
              <SquareIcon className="size-3 fill-current" /> Stop
            </button>
          </div>
        ) : (
          <Input
            placeholder="Synapse"
            value={composerText}
            onChange={handleComposerTextChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-full h-10 px-4"
          />
        )}

        {!composerText.trim() && !isRecording ? (
          <Button
            variant="ghost"
            isIconOnly
            onPress={startRecording}
            className="size-9 shrink-0 text-accent"
          >
            <MicIcon className="size-5" />
          </Button>
        ) : (
          <Button variant="primary" isIconOnly isDisabled={!composerText.trim()} onPress={handleSend}>
            <SendHorizontalIcon className="size-5" />
          </Button>
        )}
      </div>
    </footer>
  );
}
