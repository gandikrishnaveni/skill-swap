const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const authenticate = require("../middleware/authMiddleware");

// 🔍 Get or create a 1-on-1 chat between two users
router.post('/create-or-get', authenticate, async (req, res) => {
  const { peerId } = req.body;

  try {
    let chat = await Chat.findOne({
      users: { $all: [req.user.id, peerId] },
      isGroupChat: false,
    }).populate('users');

    if (!chat) {
      chat = new Chat({
        users: [req.user.id, peerId],
        isGroupChat: false,
      });
      await chat.save();
      chat = await chat.populate('users');
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Error creating/getting chat:', err);
    res.status(500).json({ message: 'Server error while creating/getting chat' });
  }
});

// 📩 Send a message in a 1-on-1 chat
router.post('/send/:chatId', authenticate, async (req, res) => {
  const { content } = req.body;
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this chat' });
    }

    const message = new Message({
      chat: chatId,
      sender: req.user.id,
      content,
    });

    await message.save();

    chat.messages.push(message._id);
    await chat.save();

    res.status(200).json({ message: 'Message sent', message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// 📜 Get chat messages (specific chat history)
router.get('/history/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'name email profilePhoto' }
      });

    if (!chat || !chat.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this chat' });
    }

    res.status(200).json(chat.messages);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Server error while fetching chat history' });
  }
});

// 🔍 Get chat history between two users (via sender and recipient)
router.get('/:fromId/:toId', authenticate, async (req, res) => {
  const { fromId, toId } = req.params;

  try {
    const chat = await Chat.findOne({
      users: { $all: [fromId, toId] },
      isGroupChat: false,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found between these users' });
    }

    const messages = await Message.find({
      $or: [
        { sender: fromId, recipient: toId },
        { sender: toId, recipient: fromId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching chat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


