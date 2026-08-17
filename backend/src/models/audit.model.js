import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
