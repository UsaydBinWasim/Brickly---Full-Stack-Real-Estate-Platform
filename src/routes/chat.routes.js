const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

// All chat routes require authentication
router.use(protect);

router.post("/conversations", chatController.startConversation);
router.get("/conversations", chatController.getConversations);
router.get("/conversations/:id/messages", chatController.getMessages);
router.post("/conversations/:id/messages", chatController.sendMessage);
router.get("/unread", chatController.getUnreadCount);

module.exports = router;
