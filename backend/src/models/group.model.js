import mongoose from "mongoose";
import crypto from "crypto";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    inviteCode: {
      type: String,
      default: () => crypto.randomBytes(6).toString("hex"),
      unique: true,
    },
  },
  { timestamps: true }
);

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

export default Group;
