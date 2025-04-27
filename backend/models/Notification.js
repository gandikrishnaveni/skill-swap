const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    message: { type: String, required: true }, 
    link: { type: String, default: '' }, 
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }, 
    type: { type: String, enum: ['connection', 'service', 'general'], default: 'general' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' } // Add status field
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
