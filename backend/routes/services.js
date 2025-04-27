const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware'); 
const Service = require('../models/Service');
const Notification = require('../models/Notification');  // Import Notification model
const authenticateUser = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Store in public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST: Create new service with photo
router.post('/', authenticateUser, upload.single('photo'), async (req, res) => {
  const { title, description, category } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const newService = new Service({
      title,
      description,
      category,
      photo,
      postedBy: req.user._id, // this now works because req.user is full user
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error("❌ Error creating service:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET: Fetch all services with user info
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('postedBy', 'name profilePic');
    res.status(200).json(services);
  } catch (err) {
    console.error("❌ Error fetching services:", err);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// POST: Request a service
router.post('/request/:serviceId', authenticateUser, async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    

    // Notification message
    const notificationMessage = `${req.user.name} has requested your service: ${service.title}`;
    
    // Create a notification for the service owner
    const notification = new Notification({
      userId: service.postedBy,  // Send notification to the service owner
      message: notificationMessage,
      link: `/services/${service._id}`, // Link to the service details
      action: 'request', // Indicates it's a request
      requestorId: req.user._id, // The user who made the request
    });

    await notification.save();
    console.log('Service ID:', req.params.serviceId);
    console.log('Notification sent to:', service.postedBy);
    
    // Send a response to the requester
    res.status(200).json({ message: 'Request sent successfully', notification });
  } catch (err) {
    console.error("❌ Error requesting service:", err);
    res.status(500).json({ message: 'Error requesting service' });
  }
  
});

// POST: Accept or Reject service request
router.post('/respond/:notificationId', authenticateUser, async (req, res) => {
  const { action } = req.body; // action can be 'accept' or 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Please use "accept" or "reject".' });
  }

  try {
    // Find the notification
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only the service owner can respond to the request
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to respond to this request.' });
    }

    // Update the notification with the action (accept or reject)
    notification.status = action; // 'accepted' or 'rejected'
    await notification.save();

    // Send a notification to the requester
    const requesterNotification = new Notification({
      userId: notification.requestorId, // Send notification to the requester
      message: `Your request for the service "${notification.message}" has been ${action}.`,
      link: `/services/${notification.link.split('/')[2]}`, // Link to the service details
      action: action, // 'accepted' or 'rejected'
    });

    await requesterNotification.save();

    // Respond with success
    res.status(200).json({ message: `Service request ${action}`, notification });
  } catch (err) {
    console.error("❌ Error responding to service request:", err);
    res.status(500).json({ message: 'Error responding to service request' });
  }
});



// Delete a service
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the logged-in user is the owner of the service
   // 🔥 FIX: Check correct field for ownership
   if (service.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this service' });
  }


    // Delete the service
    await service.deleteOne();
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/my', auth, async (req, res) => {
  try {
    const services = await Service.find({ postedBy: req.user._id }); // Correct field based on your model
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching services' });
  }
});



module.exports = router;









