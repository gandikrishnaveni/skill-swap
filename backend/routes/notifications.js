const express = require('express');
const Notification = require('../models/Notification');
const authenticateUser = require('../middleware/authMiddleware');
const router = express.Router();
async function createNotification(userId, message, link = '', type = 'general') {
  // Create a new notification with the given userId, message, link, and type
  const notification = new Notification({
    userId,
    message,
    link,
    type, // Adding type field
  });

  try {
    await notification.save();
    console.log(`✅ Notification created: ${message}`);
  } catch (err) {
    console.error('❌ Error creating notification:', err);
  }
}


// Get notifications for logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/mark-as-read/:id', authenticateUser, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Accept request
router.post('/accept/:id', authenticateUser, async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.status = 'accepted';
    await notification.save();

    // Notify the requester
    await createNotification(notification.userId, 'Your request has been accepted ✅ ');

    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error accepting notification', error: err });
  }
});

// Reject request
router.post('/reject/:id', authenticateUser, async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.status = 'rejected';
    await notification.save();

    // Notify the requester
    await createNotification(notification.userId, 'Your request has been rejected ❌');

    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting notification', error: err });
  }
});
router.post('/', authenticateUser, async (req, res) => {
  const { userId, message } = req.body;
  try {
    const newNotification = new Notification({
      userId,
      message,
      status: 'pending',
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

router.post('/connect', async (req, res) => {
  const { fromUserId, toUserId } = req.body; // IDs for the sender and receiver

  try {
    // Create the connection request (logic for actual connection can go here)
    // Add a notification for the recipient
    const notification = new Notification({
      userId: toUserId,  // The user receiving the notification
      message: `${fromUserId} has sent you a connection request.`,
      link: `/profile/${fromUserId}`,  // This is a link to the sender's profile
      type: 'connection',  // Mark this as a connection request
    });

    // Save the notification to the database
    await notification.save();

    res.status(200).json({ message: 'Connection request sent and notification created.' });
  } catch (err) {
    console.error('Error sending connection request:', err);
    res.status(500).json({ message: 'Failed to send connection request' });
  }
});


module.exports = router;

