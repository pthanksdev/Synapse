import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional if groupId is present
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    audio: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },

    // Feature: View Once Self-Destruct
    isViewOnce: {
      type: Boolean,
      default: false,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },

    // Feature: 3-Word Passphrase Encryption
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptedText: {
      type: String,
    },
    passphraseHash: {
      type: String,
    },

    // Feature: Admin Moderation & Reporting
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
    },

    // Feature: Pinning, Editing & Read Receipts
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        text: String,
        editedAt: { type: Date, default: Date.now },
      },
    ],
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],

    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isUnsent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Full-text search index for fast message searching
messageSchema.index({ text: "text" });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
