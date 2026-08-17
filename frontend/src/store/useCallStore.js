import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  isInCall: false,
  isRinging: false,
  incomingCall: null,
  peerId: null,
  isVideo: false,
  isScreenSharing: false,

  localStream: null,
  remoteStream: null,
  peerConnection: null,
  screenTrack: null,

  initCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("call:incoming", (data) => {
      if (get().isInCall || get().isRinging) {
        socket.emit("call:reject", { callerId: data.callerId });
        return;
      }
      set({ incomingCall: data, isRinging: true, isVideo: data.isVideo, peerId: data.callerId });
    });

    socket.on("call:accepted", async ({ receiverId }) => {
      set({ isRinging: false, isInCall: true });
      await get().setupWebRTC(receiverId, true);
    });

    socket.on("call:rejected", () => {
      toast.error("Call was declined");
      get().endCall();
    });

    socket.on("call:ended", () => {
      toast("Call ended", { icon: "👋" });
      get().endCall();
    });

    socket.on("webrtc:offer", async ({ senderId, offer }) => {
      if (get().peerId !== senderId) return;
      const pc = get().peerConnection;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { targetId: senderId, answer });
      }
    });

    socket.on("webrtc:answer", async ({ senderId, answer }) => {
      if (get().peerId !== senderId) return;
      const pc = get().peerConnection;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc:ice-candidate", async ({ senderId, candidate }) => {
      if (get().peerId !== senderId) return;
      const pc = get().peerConnection;
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  },

  removeCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("call:incoming");
    socket.off("call:accepted");
    socket.off("call:rejected");
    socket.off("call:ended");
    socket.off("webrtc:offer");
    socket.off("webrtc:answer");
    socket.off("webrtc:ice-candidate");
  },

  initiateCall: async (receiverId, receiverData, isVideo = true) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      set({
        localStream: stream,
        isInCall: false,
        isRinging: true,
        peerId: receiverId,
        isVideo,
      });

      socket.emit("call:initiate", {
        receiverId,
        callerData: {
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
        isVideo,
      });
    } catch (error) {
      toast.error("Microphone/Camera permission denied.");
      console.error(error);
    }
  },

  acceptCall: async () => {
    const incomingCall = get().incomingCall;
    if (!incomingCall) return;

    const socket = useAuthStore.getState().socket;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.isVideo,
        audio: true,
      });

      set({
        localStream: stream,
        isInCall: true,
        isRinging: false,
        incomingCall: null,
      });

      socket.emit("call:accept", { callerId: incomingCall.callerId });
      await get().setupWebRTC(incomingCall.callerId, false);
    } catch (error) {
      toast.error("Microphone/Camera permission denied.");
      socket.emit("call:reject", { callerId: incomingCall.callerId });
      get().endCall();
    }
  },

  rejectCall: () => {
    const incomingCall = get().incomingCall;
    const socket = useAuthStore.getState().socket;

    if (incomingCall && socket) {
      socket.emit("call:reject", { callerId: incomingCall.callerId });
    }

    get().endCall();
  },

  setupWebRTC: async (targetId, isInitiator) => {
    const socket = useAuthStore.getState().socket;
    const localStream = get().localStream;

    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        set({ remoteStream: event.streams[0] });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice-candidate", {
          targetId,
          candidate: event.candidate,
        });
      }
    };

    set({ peerConnection: pc });

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { targetId, offer });
    }
  },

  // Ultra-Premium Feature: Screen Sharing
  toggleScreenShare: async () => {
    const { isScreenSharing, peerConnection, localStream, screenTrack } = get();

    if (isScreenSharing) {
      // Stop screen share and revert to video track
      if (screenTrack) screenTrack.stop();
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find((s) => s.track.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);

      set({ isScreenSharing: false, screenTrack: null });
      toast.success("Stopped screen sharing");
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const newTrack = displayStream.getVideoTracks()[0];

        const sender = peerConnection.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(newTrack);

        newTrack.onended = () => {
          get().toggleScreenShare();
        };

        set({ isScreenSharing: true, screenTrack: newTrack });
        toast.success("Sharing your screen live!");
      } catch (error) {
        toast.error("Screen share permission denied or cancelled");
      }
    }
  },

  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const { peerId, peerConnection, localStream, remoteStream, screenTrack, isInCall } = get();

    if (isInCall && peerId && socket) {
      socket.emit("call:end", { peerId });
    }

    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop());
    if (screenTrack) screenTrack.stop();

    set({
      isInCall: false,
      isRinging: false,
      incomingCall: null,
      peerId: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isScreenSharing: false,
      screenTrack: null,
    });
  },
}));
