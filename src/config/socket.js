const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation.model");

/**
 * Initialize Socket.io with JWT authentication and chat rooms.
 */
function initializeSocket(io) {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    // Join a conversation room
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (
          conversation &&
          conversation.participants.some(
            (p) => p.toString() === socket.userId
          )
        ) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error("joinConversation error:", err.message);
      }
    });

    // Leave a conversation room
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle typing indicator
    socket.on("typing", (conversationId) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit("userTyping", { userId: socket.userId, conversationId });
    });

    socket.on("stopTyping", (conversationId) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit("userStoppedTyping", { userId: socket.userId, conversationId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
}

module.exports = initializeSocket;
