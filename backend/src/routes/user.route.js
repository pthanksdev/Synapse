import express from "express";
import {
  getConversationsForSidebar,
  getUsersForSidebar,
  searchUsers,
  toggleArchiveConversation,
  toggleBlockUser,
  togglePinConversation,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/sidebar/users", protectRoute, getUsersForSidebar);
router.get("/sidebar/conversations", protectRoute, getConversationsForSidebar);

router.post("/pin/:id", protectRoute, togglePinConversation);
router.post("/block/:id", protectRoute, toggleBlockUser);
router.post("/archive/:id", protectRoute, toggleArchiveConversation);

export default router;
