// server.cjs
async function startServer() {
  const express = require('express');
  const router = express.Router();
  const connectDB = require('./config/db');
  const Service = require('./models/Service');
  const cors = require('cors');
  const path = require('path');
  const jwt = require('jsonwebtoken');
  const multer = require('multer');
  const User = require('./models/User');
  const authenticateUser = require('./middleware/authMiddleware');
  const loginRouter = require('./routes/auth');
  const fs = require('fs');
  const fileUpload = require('express-fileupload');
  const http = require('http');
  const socketIo = require('socket.io'); 
  
  // Add socket.io
  require('dotenv').config(); // Load .env

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);  // Initialize socket.io with the server

  connectDB(); // Connect to database

  // Ensure 'uploads' directory exists
  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
// Ensure this is in your server.cjs
const skillMatchRouter = require('./routes/skillmatch'); // path to where the router is defined
app.use('/api', skillMatchRouter); // Attach the skillmatch route to the app

  // Serve static files
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/uploads', express.static(uploadDir));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Multer setup for file upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'), // Store file in 'public/uploads/'
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`), // Generate unique filename
  });

  const upload = multer({ storage });

  const notifications = require('./routes/notifications');
  app.use('/api/notifications', notifications);

  // API Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/gigs', require('./routes/gigs'));
  app.use('/login', loginRouter);
  app.use('/api/collaborators', require('./routes/collaborators'));
  
  app.get('/api/users', authenticateUser, async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.use(express.static(path.join(__dirname, 'public')));  // Ensure static files are being served

  app.get('/chat', authenticateUser, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'chat.html'));
  });

  const session = require('express-session');
  app.use(session({
    secret: 'your-secret-key', // Keep this secure
    resave: false,
    saveUninitialized: true
  }));

  app.use(cors({
    origin: 'http://localhost:3000',  // Adjust to your front-end URL
    credentials: true
  }));

  // User routes

  // Get current user profile
  app.get('/api/me', authenticateUser, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password'); // Exclude password field
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error("Error in /api/me:", err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update current user profile
  app.put('/api/me/update', authenticateUser, upload.single('profilePic'), async (req, res) => {
    try {
      const { name, email, skills } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (skills) user.skills = skills;

      // If there's a new profile picture, save its path in the database
      if (req.file) {
        user.profilePhoto = `/uploads/${req.file.filename}`; // Save relative path
      }

      await user.save();
      res.json(user); // Return the updated user
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Profile photo upload route
  app.post('/api/me/photo', authenticateUser, upload.single('photo'), async (req, res) => {
    try {
      const photoUrl = `/uploads/${req.file.filename}`;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.profilePhoto = photoUrl;
      await user.save();
      res.json({ photoUrl });
    } catch (err) {
      console.error('Error uploading photo:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Frontend route (catch-all)
  // Keep this at the very bottom of the file
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });

  // Socket.IO setup for chat functionality
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for incoming messages
    socket.on('sendMessage', (data) => {
      // Broadcast the message to the recipient
      io.to(data.to).emit('receiveMessage', data);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

startServer();



