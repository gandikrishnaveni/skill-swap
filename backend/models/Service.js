const express = require('express');
const cors = require('cors');
const app = express();

require('./db'); // this will handle the mongoose connection
const User = require('./models/User');


const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Service', serviceSchema);
