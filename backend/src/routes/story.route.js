import express from "express";
import { createStory, getActiveStories, deleteStoryByUser } from "../controllers/story.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protectRoute, upload.single("media"), createStory);
router.get("/", protectRoute, getActiveStories);
router.delete("/:id", protectRoute, deleteStoryByUser);

export default router;
