const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // 1. Check if Authorization header exists
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader); 
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  // 2. Check the format of the Authorization header
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ error: 'Authorization header must be in Bearer <token> format' });
  }

  // 3. Extract the token and verify it
  const token = parts[1];
  try {
    // 4. Verify the token using the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Find the user from the database using the ID in the decoded token
    const user = await User.findById(decoded.id); 
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 6. Attach the full user object to the request
    req.user = user;
    
    // 7. Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};





