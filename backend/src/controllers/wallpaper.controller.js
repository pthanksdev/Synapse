import Wallpaper from "../models/wallpaper.model.js";
import { uploadToImageKit } from "../lib/imagekit.js";

export async function getWallpapers(req, res, next) {
  try {
    const wallpapersDoc = await Wallpaper.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // Format output for frontend mapping id -> wallpaperId
    const wallpapers = wallpapersDoc.map((w) => ({
      _id: w._id,
      id: w.wallpaperId || w._id.toString(),
      category: w.category,
      label: w.label,
      url: w.url,
    }));

    // Extract unique categories and format section titles dynamically from DB
    const uniqueCategories = [...new Set(wallpapers.map((w) => w.category))];
    const sections = uniqueCategories.map((cat) => ({
      id: cat,
      title: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));

    res.status(200).json({
      sections,
      wallpapers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createWallpaper(req, res, next) {
  try {
    const { label, category, url } = req.body;
    if (!label || (!url && !req.file)) {
      return res.status(400).json({ message: "Wallpaper label and image are required" });
    }

    // Process image through ImageKit to get CDN link
    let cdnUrl = url;
    try {
      const uploadPayload = req.file || url;
      cdnUrl = await uploadToImageKit(uploadPayload, label, "/wallpapers");
    } catch (ikError) {
      console.warn("ImageKit upload warning, using provided url/path:", ikError.message);
    }

    const wallpaperId = label.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

    const newWallpaper = await Wallpaper.create({
      wallpaperId,
      label,
      category: category || "custom",
      url: cdnUrl,
    });

    res.status(201).json(newWallpaper);
  } catch (error) {
    next(error);
  }
}

export async function deleteWallpaper(req, res, next) {
  try {
    const { id } = req.params;
    await Wallpaper.findByIdAndDelete(id);
    res.status(200).json({ message: "Wallpaper deleted successfully" });
  } catch (error) {
    next(error);
  }
}
