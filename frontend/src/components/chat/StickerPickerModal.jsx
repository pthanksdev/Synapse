import { useState, useEffect } from "react";
import { SmileIcon, XIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { Input } from "../ui/input";

export function StickerPickerModal({ isOpen, onClose, onSelectSticker }) {
  const [search, setSearch] = useState("");
  const [stickers, setStickers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchGifs = async () => {
      setIsLoading(true);
      try {
        const query = search.trim() || "reactions";
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=GlVIt2C6vLn7Bx35v79Om9mnFg3B67JG&q=${encodeURIComponent(
            query
          )}&limit=18&rating=g`
        );
        const data = await res.json();
        if (data.data) {
          const urls = data.data.map((item) => item.images.fixed_height_small.url);
          setStickers(urls);
        }
      } catch (err) {
        console.error("Giphy fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchGifs, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-3 z-50 w-80 rounded-2xl border border-border bg-background/95 p-3 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <SmileIcon className="size-4 text-accent" /> Live Giphy Stickers & GIFs
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
          <XIcon className="size-3.5" />
        </button>
      </div>

      <div className="relative mb-2">
        <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted" />
        <Input
          placeholder="Search live GIFs & stickers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex h-36 items-center justify-center text-muted">
          <Loader2Icon className="size-6 animate-spin text-accent" />
        </div>
      ) : stickers.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-xs text-muted">
          No GIFs found for "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {stickers.map((url, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectSticker(url);
                onClose();
              }}
              className="aspect-square overflow-hidden rounded-lg bg-surface hover:scale-105 transition transform border border-border/50 flex items-center justify-center p-1"
            >
              <img src={url} alt="sticker" className="size-full object-cover rounded-md" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
