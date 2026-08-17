import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import fs from "fs";
import path from "path";

import { connectDB } from "./lib/db.js";
import { connectPostgres } from "./lib/pg.js";
import { seedAdminUser } from "./lib/seedAdmin.js";
import job from "./lib/cron.js";

// Domain Routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import callRoutes from "./routes/call.route.js";
import notificationRoutes from "./routes/notification.route.js";
import adminRoutes from "./routes/admin.route.js";
import storyRoutes from "./routes/story.route.js";
import wallpaperRoutes from "./routes/wallpaper.route.js";
import themeRoutes from "./routes/theme.route.js";

import { app, server } from "./lib/socket.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const publicDir = path.join(process.cwd(), "public");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any requesting origin dynamically to support Vercel, Render, local dev, etc.
      callback(null, origin || true);
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "healthy" });
});

// Register API Domains
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/wallpapers", wallpaperRoutes);
app.use("/api/themes", themeRoutes);

// If the public directory exists, serve static production files
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: `API endpoint ${req.path} not found` });
    }
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

// Global Error Interceptor (must be the last middleware)
app.use(globalErrorHandler);

server.listen(PORT, async () => {
  await connectDB();
  await connectPostgres();
  await seedAdminUser();
  console.log("Server is up and running on PORT:", PORT);

  if (process.env.NODE_ENV === "production") job.start();
});
