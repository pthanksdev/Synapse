import { useState } from "react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";
import { useChatStore } from "../../store/useChatStore";
import {
  CornerUpLeftIcon,
  Trash2Icon,
  SmileIcon,
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  ShieldAlertIcon,
  StarIcon,
  SendIcon,
  PencilIcon,
  PinIcon,
} from "lucide-react";
import { PassphraseUnlockModal } from "./PassphraseUnlockModal";
import { ForwardMessageModal } from "./ForwardMessageModal";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";
const TAPBACK_EMOJIS = ["❤️", "👍", "👎", "😂", "‼️", "❓"];

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function MessageBubble({ message }) {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [isStarred, setIsStarred] = useState(false);

  const toggleReaction = useChatStore((state) => state.toggleReaction);
  const unsendMessage = useChatStore((state) => state.unsendMessage);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);
  const setActiveLightboxMedia = useChatStore((state) => state.setActiveLightboxMedia);

  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const hasAudio = Boolean(message.audioUrl);
  const hasFile = Boolean(message.fileUrl);

  const isUnsent = message.isUnsent;
  const reactions = message.reactions || [];

  const isWithinUnsendWindow =
    isOwnMessage && message.createdAt && Date.now() - new Date(message.createdAt).getTime() < 120000;

  const handleConsumeViewOnce = async () => {
    try {
      await axiosInstance.post(`/messages/${message.id || message._id}/view-once`);
      setActiveLightboxMedia({ url: message.imageUrl || message.videoUrl, type: hasImage ? "image" : "video" });
    } catch (error) {
      toast.error("Failed to load view-once media");
    }
  };

  const handleReport = async () => {
    const reason = prompt("Describe the community guidelines violation:");
    if (!reason) return;
    try {
      await axiosInstance.post(`/messages/${message.id || message._id}/report`, { reason });
      toast.success("Message reported to app owner for moderation review");
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  const handleToggleStar = async () => {
    try {
      await axiosInstance.post(`/messages/${message.id || message._id}/star`);
      setIsStarred(!isStarred);
      toast.success(isStarred ? "Message unstarred" : "Message starred");
    } catch (error) {
      toast.error("Failed to update star status");
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await axiosInstance.patch(`/messages/${message.id || message._id}/edit`, { text: editText });
      message.text = editText;
      message.isEdited = true;
      setIsEditing(false);
      toast.success("Message edited");
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  return (
    <div className={`group relative flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Tapback Menu Popover */}
      {showReactionsMenu && (
        <div
          className={`absolute -top-10 z-20 flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 shadow-lg backdrop-blur-md border border-border ${
            isOwnMessage ? "right-2" : "left-2"
          }`}
        >
          {TAPBACK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                toggleReaction(message.id || message._id, emoji);
                setShowReactionsMenu(false);
              }}
              className="text-base transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <PassphraseUnlockModal
        isOpen={isUnlockModalOpen}
        messageId={message.id || message._id}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlocked={(text) => setDecryptedContent(text)}
      />

      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        message={message}
        onClose={() => setIsForwardModalOpen(false)}
      />

      {/* Bubble Container */}
      <div className="relative max-w-[min(90%,28rem)] sm:max-w-[min(75%,28rem)]">
        <div
          className={`rounded-2xl px-3 py-2 text-[15px] leading-snug sm:px-3.5 ${
            isUnsent
              ? "italic bg-surface/40 text-muted border border-border/50"
              : isOwnMessage
              ? "rounded-br-md bg-accent text-accent-foreground"
              : "rounded-bl-md bg-surface"
          }`}
        >
          {/* Quoted Message Preview */}
          {message.replyTo && (
            <div className="mb-2 rounded-lg bg-black/10 p-2 text-xs opacity-90">
              <p className="font-semibold">Replying to message:</p>
              <p className="truncate italic">{message.replyTo.text || "Media message"}</p>
            </div>
          )}

          {/* View Once Card */}
          {message.isViewOnce && !isUnsent ? (
            <div className="my-1 border border-primary/40 rounded-xl p-2.5 bg-black/10 flex items-center gap-3">
              <EyeIcon className="size-6 text-accent animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">View Once Media</p>
                <p className="text-[10px] opacity-75">
                  {message.isViewed ? "Opened & Purged" : "Tap to reveal photo/video"}
                </p>
              </div>
              {!message.isViewed && (
                <button
                  onClick={handleConsumeViewOnce}
                  className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow hover:opacity-90"
                >
                  View
                </button>
              )}
            </div>
          ) : (
            <>
              {hasImage && !isUnsent ? (
                <img
                  src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
                  alt=""
                  onClick={() => setActiveLightboxMedia({ url: message.imageUrl, type: "image" })}
                  className="mb-1.5 max-h-40 max-w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90 sm:max-h-52 sm:rounded-xl"
                />
              ) : null}

              {hasVideo && !isUnsent ? (
                <div onClick={() => setActiveLightboxMedia({ url: message.videoUrl, type: "video" })}>
                  <MessageVideo src={message.videoUrl} />
                </div>
              ) : null}
            </>
          )}

          {hasAudio && !isUnsent ? (
            <div className="my-1 flex items-center gap-2">
              <audio controls src={message.audioUrl} className="max-w-full rounded-lg h-9" />
            </div>
          ) : null}

          {/* Document Attachment Card */}
          {hasFile && !isUnsent ? (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-1.5 flex items-center gap-3 rounded-xl border border-white/20 bg-black/10 p-2.5 transition hover:bg-black/20"
            >
              <FileTextIcon className="size-8 shrink-0 text-accent" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold">{message.fileName || "Document"}</p>
                <p className="text-[10px] opacity-75">{formatBytes(message.fileSize)}</p>
              </div>
              <DownloadIcon className="size-4 shrink-0 opacity-80" />
            </a>
          ) : null}

          {/* 3-Word Encrypted Text Badge */}
          {message.isEncrypted && !decryptedContent ? (
            <button
              onClick={() => setIsUnlockModalOpen(true)}
              className="my-1 flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition w-full"
            >
              <LockIcon className="size-4" /> Tap to unlock encrypted message (3-Word Key Required)
            </button>
          ) : decryptedContent ? (
            <p className="whitespace-pre-wrap wrap-break-word font-mono bg-black/20 p-2 rounded-lg text-emerald-400 border border-emerald-500/40">
              🔓 {decryptedContent}
            </p>
          ) : isEditing ? (
            <div className="flex items-center gap-1.5 my-1">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-black/20 text-xs p-1.5 rounded-lg border border-white/20 flex-1"
              />
              <button onClick={handleSaveEdit} className="text-xs font-bold px-2 py-1 bg-accent rounded-lg">
                Save
              </button>
            </div>
          ) : message.text ? (
            <p className="whitespace-pre-wrap wrap-break-word">
              {message.text}
              {message.isEdited && <span className="ml-1 text-[10px] opacity-70 italic">(edited)</span>}
            </p>
          ) : null}

          <div
            className={`mt-1 flex items-center justify-between gap-2 text-[11px] tabular-nums ${
              isOwnMessage ? "text-accent-foreground/75" : "text-muted"
            }`}
          >
            <span>{message.time}</span>
            {isOwnMessage && message.status && !isUnsent && (
              <span className="capitalize text-[10px] opacity-80">{message.status}</span>
            )}
          </div>
        </div>

        {/* Reaction Badges Overlay */}
        {reactions.length > 0 && (
          <div
            className={`absolute -bottom-2 flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-xs shadow border border-border ${
              isOwnMessage ? "left-1" : "right-1"
            }`}
          >
            {Array.from(new Set(reactions.map((r) => r.emoji))).map((emoji) => (
              <span key={emoji}>{emoji}</span>
            ))}
            {reactions.length > 1 && (
              <span className="text-[10px] font-bold text-muted">{reactions.length}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover Action Controls */}
      {!isUnsent && (
        <div
          className={`mx-2 hidden items-center gap-1 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={() => setShowReactionsMenu(!showReactionsMenu)}
            title="React"
            className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <SmileIcon className="size-4" />
          </button>

          <button
            onClick={() => setReplyingToMessage(message)}
            title="Reply"
            className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <CornerUpLeftIcon className="size-4" />
          </button>

          <button
            onClick={handleToggleStar}
            title={isStarred ? "Unstar" : "Star"}
            className={`rounded-full p-1 ${isStarred ? "text-amber-400" : "text-muted hover:bg-surface"}`}
          >
            <StarIcon className="size-4" />
          </button>

          <button
            onClick={() => setIsForwardModalOpen(true)}
            title="Forward Message"
            className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <SendIcon className="size-4" />
          </button>

          {isOwnMessage && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Edit Message"
              className="rounded-full p-1 text-muted hover:bg-surface hover:text-foreground"
            >
              <PencilIcon className="size-4" />
            </button>
          )}

          {!isOwnMessage && (
            <button
              onClick={handleReport}
              title="Report Violation to Owner"
              className="rounded-full p-1 text-red-400 hover:bg-red-500/10"
            >
              <ShieldAlertIcon className="size-4" />
            </button>
          )}

          {isWithinUnsendWindow && (
            <button
              onClick={() => unsendMessage(message.id || message._id)}
              title="Unsend message"
              className="rounded-full p-1 text-red-500 hover:bg-red-500/10"
            >
              <Trash2Icon className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
