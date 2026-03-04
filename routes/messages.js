const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Send a message
router.post('/send', async (req, res) => {
  const { senderId, receiverId, vehicleId, content } = req.body;

  try {
    const message = new Message({
      senderId,
      receiverId,
      vehicleId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Fetch messages for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
