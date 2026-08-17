import express from "express";
import http from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "./jwt.js";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: [allowedOrigin], credentials: true },
});

// online users map = { userId: socketId }
const userSocketMap = {};

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  const userIdQuery = socket.handshake.query?.userId;

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      socket.userId = decoded.userId;
      return next();
    }
  }

  // Fallback for development if userId query exists
  if (userIdQuery) {
    socket.userId = userIdQuery;
    return next();
  }

  return next(new Error("Authentication error: Invalid or missing token"));
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // io.emit() sends event to everyone - broadcast online list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator handlers
  socket.on("typing:start", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:start", { senderId: userId });
    }
  });

  socket.on("typing:stop", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:stop", { senderId: userId });
    }
  });

  // --- WebRTC Video/Audio Calling Signaling ---
  
  // 1. Caller initiates the call
  socket.on("call:initiate", ({ receiverId, callerData, isVideo }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", {
        callerId: userId,
        callerData,
        isVideo
      });
    }
  });

  // 2. Receiver accepts the call
  socket.on("call:accept", ({ callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:accepted", { receiverId: userId });
    }
  });

  // 3. Receiver rejects the call
  socket.on("call:reject", ({ callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:rejected", { receiverId: userId });
    }
  });

  // 4. Hang up during call
  socket.on("call:end", ({ peerId }) => {
    const peerSocketId = getReceiverSocketId(peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit("call:ended");
    }
  });

  // 5. WebRTC Negotiation: Offer, Answer, ICE Candidates
  socket.on("webrtc:offer", ({ targetId, offer }) => {
    const targetSocketId = getReceiverSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:offer", { senderId: userId, offer });
    }
  });

  socket.on("webrtc:answer", ({ targetId, answer }) => {
    const targetSocketId = getReceiverSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:answer", { senderId: userId, answer });
    }
  });

  socket.on("webrtc:ice-candidate", ({ targetId, candidate }) => {
    const targetSocketId = getReceiverSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:ice-candidate", { senderId: userId, candidate });
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
