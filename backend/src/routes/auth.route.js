import express from "express";
import { checkAuth, login, logout, refreshToken, register, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.put("/profile", protectRoute, updateProfile);

export default router;
