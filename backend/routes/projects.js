const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { Project } = require('../models/Project');
// ✅ FIXED
const User = require('../models/User'); // Add this import at the top of your file



router.get('/my', auth, async (req, res) => {
  try {
    console.log("User ID:", req.user._id); // Log the user ID to make sure it's correct
    
    // Fetch projects based on the authenticated user's ID
    const projects = await Project.find({ user: req.user._id });
    console.log("Fetched projects:", projects); // Log the projects to check if they exist
    
    if (!projects) {
      return res.status(404).json({ error: 'No projects found for this user' });
    }
    
    res.json({ projects });
  } catch (err) {
    console.error("Error in /api/projects/my:", err.message); // Log the error message
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


router.post('/', auth, async (req, res) => {
  const { title, description, link } = req.body;

  if (!title || !description || !link) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newProject = new Project({
    title,
    description,
    link,
    user: req.user._id // Use `user` here as per your model
  });

  try {
    const savedProject = await newProject.save();

    // After saving the project, update the user's `projects` array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { projects: savedProject._id } },
      { new: true }
    );
    
    const updatedUser = await User.findById(req.user._id); // Get the updated user document
    console.log("Updated User:", updatedUser);
    
    res.status(201).json(savedProject);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


// 🔥 Delete a project by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id // Use `user` here for authorization check
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;





