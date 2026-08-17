import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";

// Create a new group
export async function createGroup(req, res, next) {
  try {
    const { name, description, memberIds } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Ensure current user is included in members
    const allMemberIds = Array.from(
      new Set([userId.toString(), ...(memberIds || [])])
    );

    const defaultAvatar = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(name)}`;

    const newGroup = new Group({
      name: name.trim(),
      description: description || "",
      avatar: defaultAvatar,
      creatorId: userId,
      adminIds: [userId],
      memberIds: allMemberIds,
    });

    await newGroup.save();
    await newGroup.populate("memberIds", "fullName email profilePic");
    await newGroup.populate("adminIds", "fullName email profilePic");

    // Notify all members via Socket.io
    allMemberIds.forEach((mId) => {
      const sId = getReceiverSocketId(mId);
      if (sId) {
        io.to(sId).emit("group:created", newGroup);
      }
    });

    res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
}

// Get all groups user belongs to
export async function getUserGroups(req, res, next) {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ memberIds: userId })
      .populate("memberIds", "fullName email profilePic")
      .populate("adminIds", "fullName email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

// Get group details
export async function getGroupDetails(req, res, next) {
  try {
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("memberIds", "fullName email profilePic")
      .populate("adminIds", "fullName email profilePic")
      .populate("creatorId", "fullName email profilePic");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Update Group Customization (Name, Description, Avatar)
export async function updateGroup(req, res, next) {
  try {
    const { id: groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if user is admin
    const isAdmin = group.adminIds.some((id) => id.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only group admins can update settings" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;

    if (req.file && hasImageKitConfig()) {
      group.avatar = await uploadChatMedia(req.file);
    }

    await group.save();
    await group.populate("memberIds", "fullName email profilePic");
    await group.populate("adminIds", "fullName email profilePic");

    // Broadcast update to all group members
    group.memberIds.forEach((member) => {
      const sId = getReceiverSocketId(member._id);
      if (sId) io.to(sId).emit("group:updated", group);
    });

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Add members to group
export async function addGroupMembers(req, res, next) {
  try {
    const { id: groupId } = req.params;
    const { newMemberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminIds.some((id) => id.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const updatedMembers = Array.from(
      new Set([...group.memberIds.map((id) => id.toString()), ...newMemberIds])
    );

    group.memberIds = updatedMembers;
    await group.save();
    await group.populate("memberIds", "fullName email profilePic");

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Remove member or Leave Group
export async function removeGroupMember(req, res, next) {
  try {
    const { id: groupId, userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isSelfLeaving = currentUserId.toString() === targetUserId.toString();
    const isAdmin = group.adminIds.some((id) => id.toString() === currentUserId.toString());

    if (!isSelfLeaving && !isAdmin) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    group.memberIds = group.memberIds.filter((id) => id.toString() !== targetUserId.toString());
    group.adminIds = group.adminIds.filter((id) => id.toString() !== targetUserId.toString());

    await group.save();
    await group.populate("memberIds", "fullName email profilePic");

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Toggle Admin Role
export async function toggleAdminRole(req, res, next) {
  try {
    const { id: groupId, userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminIds.some((id) => id.toString() === currentUserId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can manage roles" });
    }

    const targetIsAdmin = group.adminIds.some((id) => id.toString() === targetUserId.toString());

    if (targetIsAdmin) {
      group.adminIds = group.adminIds.filter((id) => id.toString() !== targetUserId.toString());
    } else {
      group.adminIds.push(targetUserId);
    }

    await group.save();
    await group.populate("adminIds", "fullName email profilePic");

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Send Group Message (with @mentions support)
export async function sendGroupMessage(req, res, next) {
  try {
    const { id: groupId } = req.params;
    const { text, replyToId } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Parse @mentions from text (e.g., @john)
    const mentionRegex = /@(\w+)/g;
    const matches = text ? text.match(mentionRegex) : null;
    const mentionedUserIds = [];

    if (matches && matches.length > 0) {
      const names = matches.map((m) => m.replace("@", "").toLowerCase());
      const mentionedUsers = await User.find({
        fullName: { $in: names.map((n) => new RegExp(n, "i")) },
      });
      mentionedUsers.forEach((u) => mentionedUserIds.push(u._id));
    }

    let imageUrl;
    let videoUrl;
    let documentUrl;
    let docName;
    let docSize;

    if (req.file && hasImageKitConfig()) {
      const url = await uploadChatMedia(req.file);
      docName = req.file.originalname;
      docSize = req.file.size;

      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else if (req.file.mimetype.startsWith("image/")) imageUrl = url;
      else documentUrl = url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      video: videoUrl,
      fileUrl: documentUrl,
      fileName: docName,
      fileSize: docSize,
      mentions: mentionedUserIds,
      replyTo: replyToId || null,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName email profilePic");
    if (replyToId) await newMessage.populate("replyTo");

    // Broadcast message to all group members except sender
    group.memberIds.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        const sId = getReceiverSocketId(memberId.toString());
        if (sId) {
          io.to(sId).emit("group:newMessage", newMessage);

          // If member is mentioned, send priority alert
          if (mentionedUserIds.some((m) => m.toString() === memberId.toString())) {
            io.to(sId).emit("notification:mention", {
              groupId: group._id,
              groupName: group.name,
              senderName: req.user.fullName,
              text,
            });
          }
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
}

// Get Group Messages History
export async function getGroupMessages(req, res, next) {
  try {
    const { id: groupId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName email profilePic")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    messages.reverse();
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

// Join Group via Invite Code
export async function joinGroupByInviteCode(req, res, next) {
  try {
    const { inviteCode } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ message: "Invalid or expired group invite code" });

    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      await group.save();
    }

    await group.populate("memberIds", "fullName email profilePic");
    await group.populate("adminIds", "fullName email profilePic");

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

// Regenerate Group Invite Code
export async function regenerateInviteCode(req, res, next) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminIds.some((id) => id.toString() === userId.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only group admins can reset invite code" });

    group.inviteCode = (await import("crypto")).default.randomBytes(6).toString("hex");
    await group.save();

    res.status(200).json({ inviteCode: group.inviteCode });
  } catch (error) {
    next(error);
  }
}

