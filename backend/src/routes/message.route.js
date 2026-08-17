import express from "express";
import {
  consumeViewOnce,
  editMessage,
  forwardMessage,
  getMessages,
  getSharedMedia,
  getStarredMessages,
  reportMessage,
  searchGlobalMessages,
  sendMessage,
  togglePinMessage,
  toggleReaction,
  toggleStarMessage,
  unlockEncryptedMessage,
  unsendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/search/global", protectRoute, searchGlobalMessages);
router.get("/starred", protectRoute, getStarredMessages);
router.get("/media/:id", protectRoute, getSharedMedia);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, upload.single("media"), sendMessage);
router.post("/forward", protectRoute, forwardMessage);
router.post("/:id/star", protectRoute, toggleStarMessage);
router.post("/:id/pin", protectRoute, togglePinMessage);
router.patch("/:id/edit", protectRoute, editMessage);
router.post("/:id/react", protectRoute, toggleReaction);
router.post("/:id/view-once", protectRoute, consumeViewOnce);
router.post("/:id/unlock", protectRoute, unlockEncryptedMessage);
router.post("/:id/report", protectRoute, reportMessage);
router.delete("/:id/unsend", protectRoute, unsendMessage);

export default router;
