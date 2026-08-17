import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    themeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    primaryColor: {
      type: String,
      required: true, // e.g. "#3b82f6"
    },
    secondaryColor: {
      type: String,
      default: "#1e293b",
    },
    isDark: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);

export default Theme;
