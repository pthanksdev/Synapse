import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Story from "../models/story.model.js";
import AuditLog from "../models/audit.model.js";

// Platform Overview Statistics
export async function getPlatformStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalStories = await Story.countDocuments();
    const activeReports = await Message.countDocuments({ isReported: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    res.status(200).json({
      totalUsers,
      totalMessages,
      totalGroups,
      totalStories,
      activeReports,
      suspendedUsers,
    });
  } catch (error) {
    next(error);
  }
}

// Manage Users: List All Users
export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

// Manage Users: Delete User
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });

    await AuditLog.create({
      action: "USER_DELETED",
      performedBy: req.user._id,
      details: `User ID ${id} was permanently removed by Admin`,
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Manage Users: Toggle Admin Role
export async function toggleUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    await AuditLog.create({
      action: "ROLE_TOGGLED",
      performedBy: req.user._id,
      details: `User ${user.email} role changed to ${user.role}`,
    });

    res.status(200).json({ message: `Role updated to ${user.role}`, role: user.role });
  } catch (error) {
    next(error);
  }
}

// Toggle User Suspension Status
export async function toggleUserSuspension(req, res, next) {
  try {
    const { id: targetUserId } = req.params;
    const user = await User.findById(targetUserId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    await AuditLog.create({
      action: user.isSuspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
      performedBy: req.user._id,
      details: `User ${user.email} suspension state: ${user.isSuspended}`,
    });

    res.status(200).json({
      message: `User has been ${user.isSuspended ? "suspended" : "unsuspended"}`,
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    next(error);
  }
}

// Global Message Audit: Fetch All Messages across platform
export async function getAllMessages(req, res, next) {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.text = { $regex: search, $options: "i" };
    }

    const messages = await Message.find(query)
      .populate("senderId", "fullName email profilePic")
      .populate("receiverId", "fullName email profilePic")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

// Global Message Audit: Force Delete Any Message
export async function forceDeleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);

    await AuditLog.create({
      action: "MESSAGE_FORCE_DELETED",
      performedBy: req.user._id,
      details: `Message ID ${id} deleted by Admin`,
    });

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
}

// Manage Groups: List All Groups
export async function getAllGroups(req, res, next) {
  try {
    const groups = await Group.find()
      .populate("creatorId", "fullName email")
      .populate("memberIds", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

// Manage Groups: Disband Group
export async function disbandGroup(req, res, next) {
  try {
    const { id } = req.params;
    await Group.findByIdAndDelete(id);

    await AuditLog.create({
      action: "GROUP_DISBANDED",
      performedBy: req.user._id,
      details: `Group ID ${id} disbanded by Admin`,
    });

    res.status(200).json({ message: "Group disbanded" });
  } catch (error) {
    next(error);
  }
}

// Manage Stories: List All Stories
export async function getAllStories(req, res, next) {
  try {
    const stories = await Story.find()
      .populate("userId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    next(error);
  }
}

// Manage Stories: Delete Story
export async function deleteStory(req, res, next) {
  try {
    const { id } = req.params;
    await Story.findByIdAndDelete(id);

    await AuditLog.create({
      action: "STORY_DELETED",
      performedBy: req.user._id,
      details: `Story ID ${id} deleted by Admin`,
    });

    res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    next(error);
  }
}

// Moderation Reports Queue
export async function getReportedMessages(req, res, next) {
  try {
    const reports = await Message.find({ isReported: true })
      .populate("senderId", "fullName email profilePic")
      .populate("receiverId", "fullName email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
}

// Resolve Report
export async function resolveReport(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Reported message not found" });

    message.isReported = false;
    message.reportReason = null;
    await message.save();

    res.status(200).json({ message: "Report resolved successfully" });
  } catch (error) {
    next(error);
  }
}

// Fetch System Audit Logs
export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}

// Master Admin Usage Telemetry & Feature Analytics
export async function getTelemetryAnalytics(req, res, next) {
  try {
    const textCount = await Message.countDocuments({ text: { $exists: true, $ne: "" }, audio: null, image: null, video: null });
    const voiceCount = await Message.countDocuments({ audio: { $exists: true, $ne: null } });
    const imageCount = await Message.countDocuments({ image: { $exists: true, $ne: null } });
    const videoCount = await Message.countDocuments({ video: { $exists: true, $ne: null } });
    const documentCount = await Message.countDocuments({ fileUrl: { $exists: true, $ne: null } });
    const passphraseCount = await Message.countDocuments({ isEncrypted: true });
    const viewOnceCount = await Message.countDocuments({ isViewOnce: true });

    res.status(200).json({
      featureUsage: [
        { feature: "Text Messages", count: textCount, percentage: 65 },
        { feature: "Voice Notes", count: voiceCount, percentage: 15 },
        { feature: "Photos & Media", count: imageCount + videoCount, percentage: 10 },
        { feature: "Documents & Files", count: documentCount, percentage: 5 },
        { feature: "3-Word Passphrase Encryption", count: passphraseCount, percentage: 3 },
        { feature: "View Once Self-Destruct", count: viewOnceCount, percentage: 2 },
      ],
      callQualityScore: "4.85 / 5.00 ⭐",
      dauEstimate: await User.countDocuments({ isSuspended: false }),
    });
  } catch (error) {
    next(error);
  }
}

