const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const User = require('../models/User'); // Adjust the path if necessary

// Route to fetch skill-matching users
router.get('/skillmatch', authenticateUser, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { skills } = currentUser;

        // Find all users who have at least one skill in common (excluding the current user)
        const matchingUsers = await User.find({
            skills: { $in: skills },
            _id: { $ne: req.user._id } // Don't include the current user
        }).select('name skills profilePhoto _id');

        // Only return users who have at least one skill matched
        return res.json(matchingUsers);
    } catch (err) {
        console.error('Error fetching matching users:', err);
        return res.status(500).json({ message: 'Server error fetching users' });
    }
});


module.exports = router;



  