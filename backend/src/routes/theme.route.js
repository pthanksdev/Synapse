import express from "express";
import { getThemes, createTheme, deleteTheme } from "../controllers/theme.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getThemes);
router.post("/", protectRoute, requireAdmin, createTheme);
router.delete("/:id", protectRoute, requireAdmin, deleteTheme);

export default router;
