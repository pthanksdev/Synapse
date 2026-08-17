import express from "express";
import { getIceServers, logCallHistory } from "../controllers/call.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/ice-servers", protectRoute, getIceServers);
router.post("/history", protectRoute, logCallHistory);

export default router;
