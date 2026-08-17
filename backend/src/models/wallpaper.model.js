import mongoose from "mongoose";

const wallpaperSchema = new mongoose.Schema(
  {
    wallpaperId: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      default: "desktop",
    },
    label: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Wallpaper = mongoose.models.Wallpaper || mongoose.model("Wallpaper", wallpaperSchema);

export default Wallpaper;
