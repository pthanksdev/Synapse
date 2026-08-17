import express from "express";
import {
  addGroupMembers,
  createGroup,
  getGroupDetails,
  getGroupMessages,
  getUserGroups,
  joinGroupByInviteCode,
  regenerateInviteCode,
  removeGroupMember,
  sendGroupMessage,
  toggleAdminRole,
  updateGroup,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.post("/join/:inviteCode", protectRoute, joinGroupByInviteCode);
router.get("/:id", protectRoute, getGroupDetails);
router.put("/:id", protectRoute, upload.single("avatar"), updateGroup);
router.post("/:id/invite-code", protectRoute, regenerateInviteCode);

router.post("/:id/members", protectRoute, addGroupMembers);
router.delete("/:id/members/:userId", protectRoute, removeGroupMember);
router.post("/:id/admin/:userId", protectRoute, toggleAdminRole);

router.post("/:id/messages", protectRoute, upload.single("media"), sendGroupMessage);
router.get("/:id/messages", protectRoute, getGroupMessages);

export default router;
