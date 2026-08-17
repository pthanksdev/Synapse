import express from "express";
import { createStory, getActiveStories } from "../controllers/story.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protectRoute, upload.single("media"), createStory);
router.get("/", protectRoute, getActiveStories);

export default router;
