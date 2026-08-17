import express from "express";
import { subscribeToPush, unsubscribeFromPush } from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/subscribe", protectRoute, subscribeToPush);
router.delete("/unsubscribe", protectRoute, unsubscribeFromPush);

export default router;
