const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateUser = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

require('dotenv').config(); // Load environment variables
const SECRET = process.env.JWT_SECRET;

// Enable file upload middleware
router.use(fileUpload());

// 🔐 Signup Route
// 🔐 Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, gender, skills, profileType, openToConnect } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      skills,
      profileType, // Explicitly ensure this is passed correctly
      openToConnect
    });

    await newUser.save();
    return res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    return res.status(500).json({ message: 'Server error during signup' });
  }
});


// 🔐 Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🛠️ Login attempt:", email, password);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET,
      { expiresIn: '1h' }
    );

    console.log("🧪 JWT Token Generated:", token);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        openToConnect: user.openToConnect
      }
    });
  } catch (err) {
    console.error("Error during login:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error during login' });
    }
  }
});

// 👤 GET /api/me – Get current user info
router.get('/api/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Log the user data to inspect the profilePhoto field
    console.log('User profile data:', user);

    res.json(user);  // Ensure that profilePhoto is in this response
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/// ✏️ PUT /api/me/update – Update profile info
router.put('/api/me/update', authenticateUser, async (req, res) => {
  const { name, email, skills } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, skills },
      { new: true, runValidators: true } // Ensures validations are applied during update
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser); // Return updated user data, including new profile info
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});



// Photo upload route
router.post('/api/me/photo', authenticateUser, async (req, res) => {
  try {
    // Check if file exists
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    // Get the uploaded file
    const photo = req.files.photo;
    const photoPath = `uploads/${Date.now()}-${photo.name}`; // Unique filename to avoid overwriting

    // Save the file to the public folder
    await photo.mv(`./public/${photoPath}`);

    // Update the user profile with the new photo URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: `/uploads/${photoPath}` }, // Save photo URL in user data
      { new: true }
    );

    res.json({ photoUrl: updatedUser.profilePhoto }); // Return the new photo URL
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});
// 🧑‍🤝‍🧑 Get all users (for chat list), excluding the current user
router.get('/api/users', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});



module.exports = router;



