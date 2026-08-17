import Message from "../models/message.model.js";
import User from "../models/user.model.js";

/**
 * Asynchronously synchronizes primary PostgreSQL mutations to secondary MongoDB backup & archive.
 * Non-blocking: errors in secondary backup logging are captured without disrupting primary flow.
 */
export async function syncUserToMongo(userData) {
  try {
    await User.findOneAndUpdate(
      { _id: userData.id },
      {
        fullName: userData.fullName,
        email: userData.email,
        profilePic: userData.profilePic || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error("[MongoSync] User secondary backup warning:", error.message);
  }
}

export async function syncMessageToMongo(messageData) {
  try {
    await Message.create({
      _id: messageData.id,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      text: messageData.text || "",
      image: messageData.imageUrl || "",
      video: messageData.videoUrl || "",
      createdAt: messageData.createdAt || new Date(),
    });
  } catch (error) {
    console.error("[MongoSync] Message secondary backup warning:", error.message);
  }
}
