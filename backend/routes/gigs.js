const express = require('express');
const multer = require('multer');
const router = express.Router();
const Gig = require('../models/Gig');
const authenticateUser = require('../middleware/authMiddleware'); // ✅ Corrected name

// Multer setup (you can change the destination and file limits if needed)
const upload = multer({ dest: 'uploads/' });

// POST /api/gigs/add - Add a new gig (only for authenticated users)
router.post('/add', authenticateUser, upload.array('images', 5), async (req, res) => {
    try {
        console.log("📥 Gig form data received:");
        console.log("Body:", req.body);
        console.log("Files:", req.files);
        console.log("User:", req.user);

        const { title, description, skills, category } = req.body;

        if (!title || !description || !skills || !category) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const gig = new Gig({
            title,
            description,
            skills: skills.split(',').map(s => s.trim()),
            category,
            userId: req.user._id // ✅ Ensure this matches your auth middleware
        });

        await gig.save();
        return res.status(201).json({ message: 'Gig posted successfully!' });
    } catch (err) {
        console.error("❌ Error saving gig:", err);
        return res.status(500).json({ message: 'Server error posting gig' });
    }
});

module.exports = router;
