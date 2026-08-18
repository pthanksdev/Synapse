import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["media", "text"],
      default: "media",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    bgColor: {
      type: String,
      default: "from-indigo-600 to-purple-600",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "text"],
      default: "image",
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    fitMode: {
      type: String,
      default: "cover",
    },
    caption: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours auto-expire
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Story = mongoose.models.Story || mongoose.model("Story", storySchema);

export default Story;
