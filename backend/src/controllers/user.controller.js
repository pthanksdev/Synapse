import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Fetch users with existing message history with the logged-in user
export async function getUsersForSidebar(req, res, next) {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).select("senderId receiverId");

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId && msg.senderId.toString() !== loggedInUserId.toString()) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.receiverId && msg.receiverId.toString() !== loggedInUserId.toString()) {
        userIds.add(msg.receiverId.toString());
      }
    });

    const filteredUsers = await User.find({ _id: { $in: Array.from(userIds) } });
    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
}

// Search users by username, email, or fullName
export async function searchUsers(req, res, next) {
  try {
    const loggedInUserId = req.user._id;
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(200).json([]);
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const users = await User.find({
      _id: { $ne: loggedInUserId },
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { fullName: searchRegex },
      ],
    }).limit(20);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

// Fetch active conversations sorted by last message time
export async function getConversationsForSidebar(req, res, next) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $replaceRoot: { newRoot: { $first: "$user" } } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
}

// Toggle pinning a conversation to the top of the sidebar
export async function togglePinConversation(req, res, next) {
  try {
    const { id: targetUserId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const pinnedIndex = user.pinnedChats.indexOf(targetUserId);

    if (pinnedIndex > -1) {
      user.pinnedChats.splice(pinnedIndex, 1);
    } else {
      user.pinnedChats.push(targetUserId);
    }

    await user.save();
    res.status(200).json({ pinnedChats: user.pinnedChats });
  } catch (error) {
    next(error);
  }
}

// Toggle blocking a user
export async function toggleBlockUser(req, res, next) {
  try {
    const { id: targetUserId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const blockedIndex = user.blockedUsers.indexOf(targetUserId);

    if (blockedIndex > -1) {
      user.blockedUsers.splice(blockedIndex, 1);
    } else {
      user.blockedUsers.push(targetUserId);
    }

    await user.save();
    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    next(error);
  }
}
