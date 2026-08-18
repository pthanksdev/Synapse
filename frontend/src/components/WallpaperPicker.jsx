import { Check, ImageIcon, UploadIcon } from "lucide-react";
import { useTransition, useRef, useState, useEffect } from "react";
import { useWallpaper } from "../context/wallpaper";
import { fetchWallpapersFromBackend } from "../data/wallpapers";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

function WallpaperThumb({ wallpaper, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(wallpaper.id)}
      className={[
        "relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900",
        selected
          ? "outline-2 outline-offset-2 outline-white"
          : "outline-1 outline-transparent hover:outline-white/45",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a2a2c]",
      ].join(" ")}
      aria-pressed={selected}
    >
      <img
        src={wallpaper.url}
        alt=""
        width={320}
        height={240}
        className="pointer-events-none h-full w-full object-cover select-none"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
        referrerPolicy="no-referrer"
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/55 px-2 py-1.5 text-left text-[11px] font-medium leading-tight text-white/95">
        {wallpaper.label}
      </span>
      {selected ? (
        <span className="absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-white text-[#1a1a1c] shadow-md">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function WallpaperPicker() {
  const { wallpaperId, setWallpaperId, customWallpaper } = useWallpaper();
  const [, startTransition] = useTransition();
  const fileInputRef = useRef(null);

  const [sections, setSections] = useState([]);
  const [wallpapers, setWallpapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWallpapersFromBackend().then((data) => {
      setSections(data.sections || []);
      setWallpapers(data.wallpapers || []);
      setIsLoading(false);
    });
  }, []);

  const handleSelect = (id) => {
    startTransition(() => {
      setWallpaperId(id);
    });
  };

  const handleCustomUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    if (compressed) {
      handleSelect(compressed);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" isIconOnly className="text-foreground">
          <ImageIcon className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#2a2a2c] text-foreground border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="border-b border-white/10 pb-3 shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">
            Backdrop
          </DialogTitle>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs mr-6" 
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="size-3.5 mr-1" /> Custom Upload
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp, image/gif" 
            onChange={handleCustomUpload} 
          />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-2">
          {customWallpaper && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Your Custom Background</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                <WallpaperThumb
                  wallpaper={{
                    id: "custom",
                    url: customWallpaper,
                    label: "Custom Upload",
                  }}
                  selected={wallpaperId === "custom" || wallpaperId?.startsWith("data:image/")}
                  onSelect={() => handleSelect("custom")}
                />
              </div>
            </section>
          )}

          {isLoading ? (
            <p className="text-xs text-zinc-400 text-center py-6">Loading wallpapers from server...</p>
          ) : (
            sections.map((section) => (
              <section key={section.id} className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">{section.title}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {wallpapers
                    .filter((w) => w.category === section.id)
                    .map((w) => (
                      <WallpaperThumb
                        key={w.id}
                        wallpaper={w}
                        selected={wallpaperId === w.id}
                        onSelect={handleSelect}
                      />
                    ))}
                </div>
              </section>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
