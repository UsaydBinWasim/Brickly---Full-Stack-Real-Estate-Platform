const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Property = require("../models/property.model");

/**
 * Get or create a conversation between current user and property owner.
 */
const getOrCreateConversation = async (userId, propertyId) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  const ownerId = property.user.toString();
  if (ownerId === userId) {
    const err = new Error("You cannot start a conversation with yourself");
    err.statusCode = 400;
    throw err;
  }

  // Sort so lookup is order-independent
  const participantIds = [userId, ownerId].sort();

  let conversation = await Conversation.findOne({
    participants: { $all: participantIds, $size: 2 },
    property: propertyId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: participantIds,
      property: propertyId,
    });
  }

  return conversation.populate([
    { path: "participants", select: "email role" },
    { path: "property", select: "title location price images" },
  ]);
};

/**
 * List all conversations for a user.
 */
const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "email role")
    .populate("property", "title location price images")
    .sort({ lastMessageAt: -1 });

  return conversations;
};

/**
 * Get messages for a conversation (paginated).
 */
const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
  // Verify user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  if (!conversation.participants.some((p) => p.toString() === userId)) {
    const err = new Error("Forbidden — you are not part of this conversation");
    err.statusCode = 403;
    throw err;
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .populate("sender", "email role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  // Mark unread messages from others as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { read: true }
  );

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Send a message in a conversation.
 */
const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  if (!conversation.participants.some((p) => p.toString() === senderId)) {
    const err = new Error("Forbidden — you are not part of this conversation");
    err.statusCode = 403;
    throw err;
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
  });

  // Update conversation's last message
  conversation.lastMessage = content.substring(0, 100);
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return message.populate("sender", "email role");
};

/**
 * Get unread message count for a user.
 */
const getUnreadCount = async (userId) => {
  const conversations = await Conversation.find({ participants: userId });
  const conversationIds = conversations.map((c) => c._id);

  const count = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: userId },
    read: false,
  });

  return count;
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};
