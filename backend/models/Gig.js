const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes you have a User model
    required: true
  },
  images: [
    {
      filename: String,
      path: String,
      originalname: String,
      mimetype: String
    }
  ],
  attachments: [
    {
      filename: String,
      path: String,
      originalname: String,
      mimetype: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);
