import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../../lib/axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PlusIcon, Trash2Icon, ImageIcon, PaletteIcon, UploadIcon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

export function AdminWallpapersTab() {
  const [wallpapers, setWallpapers] = useState([]);
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // New wallpaper form
  const [wpLabel, setWpLabel] = useState("");
  const [wpCategory, setWpCategory] = useState("desktop");
  const [wpUrl, setWpUrl] = useState("");
  const fileInputRef = useRef(null);

  // New theme form
  const [themeName, setThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wpRes, themeRes] = await Promise.all([
        axiosInstance.get("/wallpapers"),
        axiosInstance.get("/themes"),
      ]);
      setWallpapers(wpRes.data.wallpapers || []);
      setThemes(themeRes.data || []);
    } catch (error) {
      toast.error("Failed to load wallpapers and themes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle local image file upload to ImageKit via Base64 payload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWpUrl(event.target.result);
      if (!wpLabel) {
        setWpLabel(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Wallpaper
  const handleAddWallpaper = async (e) => {
    e.preventDefault();
    if (!wpLabel || !wpUrl) return toast.error("Label and image URL/File are required");

    setIsUploading(true);
    try {
      await axiosInstance.post("/wallpapers", {
        label: wpLabel,
        category: wpCategory,
        url: wpUrl,
      });
      toast.success("Wallpaper uploaded to ImageKit CDN & saved to DB!");
      setWpLabel("");
      setWpUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add wallpaper");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Wallpaper
  const handleDeleteWallpaper = async (id) => {
    if (!confirm("Delete wallpaper from database?")) return;
    try {
      await axiosInstance.delete(`/wallpapers/${id}`);
      toast.success("Wallpaper deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete wallpaper");
    }
  };

  // Add Theme
  const handleAddTheme = async (e) => {
    e.preventDefault();
    if (!themeName || !primaryColor) return toast.error("Name and primary color are required");

    try {
      await axiosInstance.post("/themes", {
        name: themeName,
        primaryColor,
        secondaryColor,
      });
      toast.success("New theme added to database!");
      setThemeName("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add theme");
    }
  };

  // Delete Theme
  const handleDeleteTheme = async (id) => {
    if (!confirm("Delete theme from database?")) return;
    try {
      await axiosInstance.delete(`/themes/${id}`);
      toast.success("Theme deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete theme");
    }
  };

  return (
    <div className="space-y-8">
      {/* Wallpapers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="size-5 text-accent" /> Wallpapers (ImageKit CDN & Database)
          </h2>
          <span className="text-xs text-muted font-mono">{wallpapers.length} Wallpapers</span>
        </div>

        {/* Add Wallpaper Form */}
        <form onSubmit={handleAddWallpaper} className="bg-surface/40 p-4 rounded-xl border border-white/5 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Add New Wallpaper (Uploads to ImageKit CDN)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <Input
              placeholder="Wallpaper Label (e.g. Sonoma Horizon)"
              value={wpLabel}
              onChange={(e) => setWpLabel(e.target.value)}
              className="bg-zinc-900 border-white/10"
            />
            <select
              value={wpCategory}
              onChange={(e) => setWpCategory(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-foreground text-sm rounded-lg px-3 py-2"
            >
              <option value="desktop">Desktop</option>
              <option value="abstract">Abstract</option>
              <option value="scenery">Scenery</option>
              <option value="minimal">Minimal</option>
            </select>
            <Input
              placeholder="Image URL or Base64"
              value={wpUrl.startsWith("data:") ? "[Image File Loaded]" : wpUrl}
              onChange={(e) => setWpUrl(e.target.value)}
              className="bg-zinc-900 border-white/10"
            />
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1 border-white/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-3.5" /> Choose Image File
              </Button>
            </div>
          </div>
          <Button type="submit" size="sm" variant="secondary" className="gap-1" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" /> Uploading to ImageKit CDN...
              </>
            ) : (
              <>
                <PlusIcon className="size-4" /> Save to ImageKit CDN & Database
              </>
            )}
          </Button>
        </form>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {wallpapers.map((wp) => (
            <div key={wp._id || wp.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow">
              <img src={wp.url} alt={wp.label} className="w-full h-24 object-cover" />
              <div className="p-2 text-xs flex items-center justify-between">
                <span className="font-medium truncate">{wp.label}</span>
                {wp._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteWallpaper(wp._id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Themes Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PaletteIcon className="size-5 text-purple-400" /> Color Themes (Database)
          </h2>
          <span className="text-xs text-muted font-mono">{themes.length} Themes</span>
        </div>

        {/* Add Theme Form */}
        <form onSubmit={handleAddTheme} className="bg-surface/40 p-4 rounded-xl border border-white/5 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Add Custom Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <Input
              placeholder="Theme Name (e.g. Midnight Sapphire)"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="bg-zinc-900 border-white/10"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Primary:</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-8 rounded bg-transparent cursor-pointer border-0"
              />
              <span className="font-mono text-xs">{primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Secondary:</span>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-8 rounded bg-transparent cursor-pointer border-0"
              />
              <span className="font-mono text-xs">{secondaryColor}</span>
            </div>
          </div>
          <Button type="submit" size="sm" variant="secondary" className="gap-1">
            <PlusIcon className="size-4" /> Save Theme to DB
          </Button>
        </form>

        {/* Theme List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <div key={theme._id || theme.themeId} className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="size-6 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div>
                  <div className="text-xs font-semibold">{theme.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">{theme.primaryColor}</div>
                </div>
              </div>
              {theme._id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-red-400 hover:text-red-300"
                  onClick={() => handleDeleteTheme(theme._id)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
