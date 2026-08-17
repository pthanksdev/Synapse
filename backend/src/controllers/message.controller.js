import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia, uploadToImageKit } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { syncMessageToMongo } from "../lib/mongoSync.js";

export async function getMessages(req, res, next) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    
    // Feature 23: Pagination support
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Reverse to send oldest first for correct chat display order
    messages.reverse();

    // Mark unread messages sent to me as read
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, status: { $ne: "read" } },
      { status: "read", readAt: new Date() }
    );

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

export async function getSharedMedia(req, res, next) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const mediaMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      isUnsent: { $ne: true },
      isViewed: { $ne: true }, // Don't show already self-destructed view-once media
      $or: [
        { image: { $exists: true, $ne: null } },
        { video: { $exists: true, $ne: null } },
        { audio: { $exists: true, $ne: null } },
        { fileUrl: { $exists: true, $ne: null } },
      ],
    }).sort({ createdAt: -1 });

    const media = mediaMessages.map((m) => ({
      _id: m._id,
      image: m.image,
      video: m.video,
      audio: m.audio,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileSize: m.fileSize,
      createdAt: m.createdAt,
      type: m.image ? "image" : m.video ? "video" : m.audio ? "audio" : "file",
    }));

    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { text, image, video, audioUrl, replyToId, isViewOnce, passphrase } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if receiver has blocked sender
    const receiverUser = await User.findById(receiverId);
    if (receiverUser?.blockedUsers?.includes(senderId)) {
      return res.status(403).json({ message: "Message cannot be delivered" });
    }

    let imageUrl;
    let videoUrl;
    let documentUrl;
    let docName;
    let docSize;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      docName = req.file.originalname;
      docSize = req.file.size;

      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else if (req.file.mimetype.startsWith("image/")) {
        imageUrl = url;
      } else {
        documentUrl = url;
      }
    } else {
      if (image) {
        try {
          imageUrl = await uploadToImageKit(image, "chat-image", "/chat");
        } catch (err) {
          imageUrl = image;
        }
      }
      if (video) {
        try {
          videoUrl = await uploadToImageKit(video, "chat-video", "/chat");
        } catch (err) {
          videoUrl = video;
        }
      }
    }

    let isEncrypted = false;
    let passphraseHash = null;
    let encryptedText = null;

    // If 3-word passphrase is supplied, encrypt text payload
    if (passphrase && passphrase.trim()) {
      isEncrypted = true;
      const salt = await bcrypt.genSalt(10);
      passphraseHash = await bcrypt.hash(passphrase.trim().toLowerCase(), salt);
      // For demonstration, store encoded text (in production, AES ciphertext using passphrase key)
      encryptedText = Buffer.from(text || "Secret Message").toString("base64");
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: isEncrypted ? "🔒 Encrypted Message (3-Word Key Required)" : text,
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
      fileUrl: documentUrl,
      fileName: docName,
      fileSize: docSize,
      isViewOnce: Boolean(isViewOnce),
      isEncrypted,
      encryptedText,
      passphraseHash,
      replyTo: replyToId || null,
      status: getReceiverSocketId(receiverId) ? "delivered" : "sent",
    });

    await newMessage.save();

    if (replyToId) {
      await newMessage.populate("replyTo");
    }

    // Secondary backup sync
    syncMessageToMongo({
      id: newMessage._id.toString(),
      senderId,
      receiverId,
      text: newMessage.text,
      imageUrl,
      videoUrl,
      createdAt: newMessage.createdAt,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
}

// Consume View-Once Media (Purges media from database upon first view)
export async function consumeViewOnce(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (!message.isViewOnce) return res.status(400).json({ message: "Not a view-once message" });

    message.isViewed = true;
    message.image = null;
    message.video = null;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:viewed", messageId);
    }

    res.status(200).json({ message: "View-once media consumed and purged" });
  } catch (error) {
    next(error);
  }
}

// Decrypt Passphrase Protected Message
export async function unlockEncryptedMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const { passphrase } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (!message.isEncrypted) return res.status(400).json({ message: "Message is not encrypted" });

    const isMatch = await bcrypt.compare(passphrase.trim().toLowerCase(), message.passphraseHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid 3-word passphrase" });
    }

    const decryptedText = Buffer.from(message.encryptedText, "base64").toString("utf-8");
    res.status(200).json({ decryptedText });
  } catch (error) {
    next(error);
  }
}

// Report message to App Owner / Admin moderation pool
export async function reportMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const { reason } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isReported = true;
    message.reportReason = reason || "Violation of community standards";
    await message.save();

    res.status(200).json({ message: "Message reported to owner for moderation review" });
  } catch (error) {
    next(error);
  }
}

export async function toggleReaction(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const targetUserId = message.senderId.toString() === userId.toString() ? message.receiverId : message.senderId;
    const targetSocketId = getReceiverSocketId(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("message:reaction", message);
    }

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function unsendMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only unsend your own messages" });
    }

    const ageInMs = Date.now() - new Date(message.createdAt).getTime();
    if (ageInMs > 120000) {
      return res.status(400).json({ message: "Unsend window (2 minutes) has expired" });
    }

    message.isUnsent = true;
    message.text = "Message was unsent";
    message.image = null;
    message.video = null;
    message.audio = null;
    message.fileUrl = null;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:unsent", message);
    }

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function searchGlobalMessages(req, res, next) {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || !q.trim()) {
      return res.status(200).json([]);
    }

    const matches = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      $text: { $search: q },
    })
      .limit(20)
      .sort({ createdAt: -1 });

    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
}

export async function toggleStarMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const index = user.starredMessages.indexOf(messageId);

    if (index > -1) {
      user.starredMessages.splice(index, 1);
    } else {
      user.starredMessages.push(messageId);
    }

    await user.save();
    res.status(200).json({ starredMessages: user.starredMessages });
  } catch (error) {
    next(error);
  }
}

export async function getStarredMessages(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "starredMessages",
      populate: { path: "senderId", select: "fullName profilePic" },
    });

    res.status(200).json(user.starredMessages || []);
  } catch (error) {
    next(error);
  }
}

export async function editMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.editHistory.push({ text: message.text });
    message.text = text;
    message.isEdited = true;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message:edited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function togglePinMessage(req, res, next) {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isPinned = !message.isPinned;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function forwardMessage(req, res, next) {
  try {
    const { messageId, targetUserIds, targetGroupIds } = req.body;
    const senderId = req.user._id;

    const originalMsg = await Message.findById(messageId);
    if (!originalMsg) return res.status(404).json({ message: "Message not found" });

    const createdMessages = [];

    // Forward to Users
    if (targetUserIds && targetUserIds.length > 0) {
      for (const targetId of targetUserIds) {
        const fwdMsg = await Message.create({
          senderId,
          receiverId: targetId,
          text: originalMsg.text,
          image: originalMsg.image,
          video: originalMsg.video,
          audio: originalMsg.audio,
          fileUrl: originalMsg.fileUrl,
          fileName: originalMsg.fileName,
          fileSize: originalMsg.fileSize,
        });
        createdMessages.push(fwdMsg);

        const recSocket = getReceiverSocketId(targetId);
        if (recSocket) io.to(recSocket).emit("newMessage", fwdMsg);
      }
    }

    // Forward to Groups
    if (targetGroupIds && targetGroupIds.length > 0) {
      for (const groupId of targetGroupIds) {
        const fwdGroupMsg = await Message.create({
          senderId,
          groupId,
          text: originalMsg.text,
          image: originalMsg.image,
          video: originalMsg.video,
          audio: originalMsg.audio,
          fileUrl: originalMsg.fileUrl,
          fileName: originalMsg.fileName,
          fileSize: originalMsg.fileSize,
        });
        createdMessages.push(fwdGroupMsg);
        io.to(`group:${groupId}`).emit("groupMessage", fwdGroupMsg);
      }
    }

    res.status(201).json({ message: "Message forwarded successfully", createdMessages });
  } catch (error) {
    next(error);
  }
}

