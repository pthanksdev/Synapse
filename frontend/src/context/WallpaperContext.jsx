import { useEffect, useState } from "react";
import { fetchWallpapersFromBackend, frameStyleFromUrl } from "../data/wallpapers";
import { WallpaperContext } from "./wallpaper";

const STORAGE_KEY = "chat-wallpaper-id";
const CUSTOM_STORAGE_KEY = "chat-custom-wallpaper-data";

function readStoredWallpaperId() {
  const wallpaperId = localStorage.getItem(STORAGE_KEY);
  if (wallpaperId) return wallpaperId;
  return "sonoma-horizon";
}

function readStoredCustomWallpaper() {
  try {
    return localStorage.getItem(CUSTOM_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function WallpaperProvider({ children }) {
  const [wallpaperId, setWallpaperIdState] = useState(readStoredWallpaperId);
  const [customWallpaper, setCustomWallpaperState] = useState(readStoredCustomWallpaper);
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
      if (wallpaperId) {
        localStorage.setItem(STORAGE_KEY, wallpaperId);
      }
    } catch (e) {
      console.warn("Could not save wallpaper to localStorage", e);
    }
  }, [wallpaperId]);

  const setCustomWallpaper = (dataUrl) => {
    try {
      if (dataUrl) {
        localStorage.setItem(CUSTOM_STORAGE_KEY, dataUrl);
      } else {
        localStorage.removeItem(CUSTOM_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Could not save custom wallpaper data to localStorage", e);
    }
    setCustomWallpaperState(dataUrl);
  };

  const isCustom = wallpaperId === "custom" || wallpaperId?.startsWith("data:image/") || wallpaperId?.startsWith("http");

  let wallpaper;
  if (isCustom) {
    const url = (wallpaperId?.startsWith("data:image/") || wallpaperId?.startsWith("http")) ? wallpaperId : customWallpaper;
    wallpaper = { id: "custom", url: url || customWallpaper, label: "Custom Upload", category: "custom" };
  } else {
    const found = backendWallpapers.find((w) => w.id === wallpaperId);
    wallpaper = found || {
      id: wallpaperId,
      url: `/wallpapers/${wallpaperId}.jpg`,
      label: wallpaperId,
    };
  }

  const setWallpaperId = (id) => {
    if (id?.startsWith("data:image/")) {
      setCustomWallpaper(id);
      setWallpaperIdState("custom");
    } else {
      setWallpaperIdState(id);
    }
  };

  const frameStyle = frameStyleFromUrl(wallpaper?.url);

  return (
    <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId, wallpaper, frameStyle, backendWallpapers, customWallpaper, setCustomWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}
