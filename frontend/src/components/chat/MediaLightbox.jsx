import { useChatStore } from "../../store/useChatStore";
import { DownloadIcon, XIcon } from "lucide-react";

export function MediaLightbox() {
  const activeLightboxMedia = useChatStore((state) => state.activeLightboxMedia);
  const setActiveLightboxMedia = useChatStore((state) => state.setActiveLightboxMedia);

  if (!activeLightboxMedia) return null;

  const { url, type } = activeLightboxMedia;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          title="Download Media"
        >
          <DownloadIcon className="size-5" />
        </a>
        <button
          onClick={() => setActiveLightboxMedia(null)}
          className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          title="Close Lightbox"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* Media Display Area */}
      <div className="max-h-[90vh] max-w-[90vw] p-2">
        {type === "video" ? (
          <video src={url} controls autoPlay className="max-h-[85vh] max-w-[85vw] rounded-2xl shadow-2xl" />
        ) : (
          <img src={url} alt="Full view" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
        )}
      </div>
    </div>
  );
}
