import express from "express";
import { getWallpapers, createWallpaper, deleteWallpaper } from "../controllers/wallpaper.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getWallpapers);
router.post("/", protectRoute, requireAdmin, createWallpaper);
router.delete("/:id", protectRoute, requireAdmin, deleteWallpaper);

export default router;
