const chatService = require("../services/chat.service");

/**
 * POST /api/chat/conversations
 * Body: { propertyId }
 */
const startConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.getOrCreateConversation(
      req.user.userId,
      req.body.propertyId
    );
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getUserConversations(
      req.user.userId
    );
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/conversations/:id/messages
 */
const getMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const result = await chatService.getMessages(
      req.params.id,
      req.user.userId,
      pageNum,
      limitNum
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/conversations/:id/messages
 * Body: { content }
 */
const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(
      req.params.id,
      req.user.userId,
      req.body.content
    );

    // Emit via Socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${req.params.id}`).emit("newMessage", message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/unread
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await chatService.getUnreadCount(req.user.userId);
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};
