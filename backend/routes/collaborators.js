const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");
const Notification = require('../models/Notification'); 

// Get all other users for collaboration
router.get("/", authenticate, async (req, res) => {
  console.log("REQ HEADERS:", req.headers);
  console.log("User ID:", req.user);
  try {
    const allUsers = await User.find({ _id: { $ne: req.user.id } }).select("name skills paid profilePhoto email _id");
    console.log(allUsers);  // Check if the users are fetched correctly

    // Now include full path for profile photos
    const collaborators = allUsers.map(user => ({
      _id: user._id,
      name: user.name,
      skills: user.skills,
      paid: user.paid,
      profilePhoto: user.profilePhoto && user.profilePhoto !== '/default-profile-photo.jpg' ? `http://localhost:3000${user.profilePhoto}` : null, // Absolute path for photo
      email: user.email
    }));

    res.json({ collaborators });
  } catch (err) {
    console.error(err);  // Log the actual error message
    res.status(500).json({ error: "Failed to fetch collaborators" });
  }
});

// Accept connection request
router.post("/accept/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Logged-in user accepting the connection
    const target = await User.findById(req.params.id);  // Target user who sent the connection request

    if (!user || !target) return res.status(404).json({ error: "User not found" });

    // Add each other as connections (only if they are not already connected)
    if (!user.connections.includes(target._id)) {
      user.connections.push(target._id);
    }
    if (!target.connections.includes(user._id)) {
      target.connections.push(user._id);
    }

    // Save the new connections
    await user.save();
    await target.save();

    // Check if notifications already exist (to prevent duplication)
    const existingUserNotification = await Notification.findOne({
      userId: user._id,
      message: `You are now connected with ${target.name}.`
    });

    const existingTargetNotification = await Notification.findOne({
      userId: target._id,
      message: `You are now connected with ${user.name}.`
    });

    // Create "You're connected" notifications for both users, if they don't exist
    if (!existingUserNotification) {
      const userNotification = new Notification({
        userId: user._id,  // The user receiving the notification
        message: `You are now connected with ${target.name}.`,
        link: `/profile/${target._id}`,  // Link to navigate to the connected user's profile
        read: false,
      });
      await userNotification.save();
    }

    if (!existingTargetNotification) {
      const targetNotification = new Notification({
        userId: target._id,  // The target user receiving the notification
        message: `You are now connected with ${user.name}.`,
        link: `/profile/${user._id}`,
        read: false,
      });
      await targetNotification.save();
    }

    res.json({ message: "Connection accepted and notifications sent." });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ error: "Failed to accept connection" });
  }
});
// Request a connection (this would add the connection to the user's list)
router.post("/connect/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Logged-in user
    const target = await User.findById(req.params.id);  // Target user

    if (!user || !target) return res.status(404).json({ error: "User not found" });

    // Send connection request, ensure that it's not a duplicate
    if (!user.pendingConnections.includes(target._id)) {
      user.pendingConnections.push(target._id);
      await user.save();
    }

    res.json({ message: "Connection request sent." });
  } catch (err) {
    console.error("Connect error:", err);
    res.status(500).json({ error: "Failed to send connection request" });
  }
});
const sendConnectionNotification = (senderId, receiverId) => {
  // Example: Create notifications for both the sender and receiver
  const notification = new Notification({
    sender: senderId,
    receiver: receiverId,
    message: 'You\'re connected!',
    type: 'connection',  // Example type, modify as per your setup
    timestamp: new Date(),
  });

  // Save the notification to the database
  notification.save()
    .then(savedNotification => {
      console.log('Notification saved:', savedNotification);
      // Optionally, you can send the notification to the user immediately here via websockets or similar
    })
    .catch(err => {
      console.error('Error saving notification:', err);
    });
};
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Collaborator not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching collaborator:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/connections', authenticate, async (req, res) => {
  try {
    // Find connections where the user is either user1 or user2 and the status is 'accepted'
    const connections = await Connection.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      status: 'accepted',
    }).populate('user1 user2');

    // Filter the connected users
    const connectedUsers = connections.map(connection => {
      return connection.user1._id.toString() === req.user._id.toString()
        ? connection.user2
        : connection.user1;
    });

    res.status(200).json(connectedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching connections' });
  }
});
router.get('/connections/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching connections for userId: ${userId}`);  // Add this line

    // Find connections for the given userId
    const connections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'accepted',
    }).populate('user1 user2');

    const connectedUsers = connections.map(connection => {
      return connection.user1._id.toString() === userId.toString()
        ? connection.user2
        : connection.user1;
    });

    res.status(200).json(connectedUsers);
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ message: 'Error fetching connections' });
  }
});





module.exports = router;


