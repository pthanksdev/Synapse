import express from "express";
import {
  getPlatformStats,
  getAllUsers,
  deleteUser,
  toggleUserRole,
  toggleUserSuspension,
  getAllMessages,
  forceDeleteMessage,
  getAllGroups,
  disbandGroup,
  getAllStories,
  deleteStory,
  getReportedMessages,
  resolveReport,
  getAuditLogs,
  getTelemetryAnalytics,
} from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to ensure user has Admin role
async function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}

router.get("/stats", protectRoute, requireAdmin, getPlatformStats);
router.get("/telemetry", protectRoute, requireAdmin, getTelemetryAnalytics);

// User Management
router.get("/users", protectRoute, requireAdmin, getAllUsers);
router.delete("/users/:id", protectRoute, requireAdmin, deleteUser);
router.patch("/users/:id/role", protectRoute, requireAdmin, toggleUserRole);
router.post("/users/:id/suspend", protectRoute, requireAdmin, toggleUserSuspension);

// Global Message Feed Audit
router.get("/messages", protectRoute, requireAdmin, getAllMessages);
router.delete("/messages/:id", protectRoute, requireAdmin, forceDeleteMessage);

// Group Management
router.get("/groups", protectRoute, requireAdmin, getAllGroups);
router.delete("/groups/:id", protectRoute, requireAdmin, disbandGroup);

// Story Moderation
router.get("/stories", protectRoute, requireAdmin, getAllStories);
router.delete("/stories/:id", protectRoute, requireAdmin, deleteStory);

// Reports Queue & Audit Trail
router.get("/reports", protectRoute, requireAdmin, getReportedMessages);
router.post("/reports/:id/resolve", protectRoute, requireAdmin, resolveReport);
router.get("/audit-logs", protectRoute, requireAdmin, getAuditLogs);

export default router;
