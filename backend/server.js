<<<<<<< HEAD
// server.js
const express = require('express');
const connectDB = require('./config/db');
=======
const express = require('express');
const connectDB = require('./config/db'); // Only this handles mongoose
>>>>>>> eaab3b1252f782cd75982f939fc63c622219f6fb
const cors = require('cors');
const path = require('path');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

// Routes
<<<<<<< HEAD
app.use('/api/auth', require('./routes/auth'));  // Authentication routes (login, signup)
app.use('/api/services', require('./routes/services')); // Services routes
app.use('/api/projects', require('./routes/projects')); // Project-related routes
app.use('/api/collaborators', require('./routes/collaborators')); // Collaborator-related routes
app.use('/api/chat', require('./routes/chat')); // Chat functionality
app.use('/api/events', require('./routes/events')); 
// Event updates

// Serve the frontend (React, etc.)
=======
app.use('/api', require('./routes/auth'));

// Catch-all for frontend routes
>>>>>>> eaab3b1252f782cd75982f939fc63c622219f6fb
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



>>>>>>> eaab3b1252f782cd75982f939fc63c622219f6fb
