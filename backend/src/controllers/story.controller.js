import Story from "../models/story.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

export async function createStory(req, res, next) {
  try {
    const { caption } = req.body;
    const userId = req.user._id;

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
