import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "voice_note_sent",
        "video_call_started",
        "audio_call_started",
        "passphrase_encrypted_message",
        "view_once_media_sent",
        "custom_theme_set",
        "custom_wallpaper_uploaded",
        "story_posted",
        "location_shared",
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Telemetry = mongoose.models.Telemetry || mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
