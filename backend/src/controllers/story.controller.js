import Story from "../models/story.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

export async function createStory(req, res, next) {
  try {
    const { caption } = req.body;
    const userId = req.user._id;

    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts are for system oversight and cannot post stories." });
    }

    if (!req.file || !hasImageKitConfig()) {
      return res.status(400).json({ message: "Media image/video file is required for Story" });
    }

    const mediaUrl = await uploadChatMedia(req.file);

    const story = new Story({
      userId,
      mediaUrl,
      caption: caption || "",
    });

    await story.save();
    await story.populate("userId", "fullName profilePic");

    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
}

export async function getActiveStories(req, res, next) {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate("userId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    next(error);
  }
}

export async function deleteStoryByUser(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this story" });
    }

    await Story.findByIdAndDelete(id);
    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    next(error);
  }
}
