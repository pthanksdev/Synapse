import { axiosInstance } from "../lib/axios";

export async function fetchWallpapersFromBackend() {
  try {
    const res = await axiosInstance.get("/wallpapers");
    return res.data; // { sections: [...], wallpapers: [...] }
  } catch (error) {
    console.error("Failed to fetch wallpapers from backend:", error);
    return { sections: [], wallpapers: [] };
  }
}

export function frameStyleFromUrl(url) {
  if (!url) return {};
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
