import { useEffect, useState } from "react";
import { fetchWallpapersFromBackend, frameStyleFromUrl } from "../data/wallpapers";
import { WallpaperContext } from "./wallpaper";

const STORAGE_KEY = "chat-wallpaper-id";

function readStoredWallpaperId() {
  const wallpaperId = localStorage.getItem(STORAGE_KEY);
  if (wallpaperId) return wallpaperId;
  return "sonoma-horizon";
}

export function WallpaperProvider({ children }) {
  const [wallpaperId, setWallpaperIdState] = useState(readStoredWallpaperId);
  const [backendWallpapers, setBackendWallpapers] = useState([]);

  useEffect(() => {
    fetchWallpapersFromBackend().then((data) => {
      if (data?.wallpapers) {
        setBackendWallpapers(data.wallpapers);
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, wallpaperId);
    } catch (e) {
      console.warn("Could not save wallpaper to localStorage", e);
    }
  }, [wallpaperId]);

  const isCustom = wallpaperId?.startsWith("data:image/") || wallpaperId?.startsWith("http");

  let wallpaper;
  if (isCustom) {
    wallpaper = { id: "custom", url: wallpaperId, label: "Custom Upload", category: "custom" };
  } else {
    const found = backendWallpapers.find((w) => w.id === wallpaperId);
    wallpaper = found || {
      id: wallpaperId,
      url: `/wallpapers/${wallpaperId}.jpg`,
      label: wallpaperId,
    };
  }

  const setWallpaperId = (id) => {
    setWallpaperIdState(id);
  };

  const frameStyle = frameStyleFromUrl(wallpaper?.url);

  return (
    <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId, wallpaper, frameStyle, backendWallpapers }}>
      {children}
    </WallpaperContext.Provider>
  );
}
