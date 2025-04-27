
const mongoose = require("mongoose");
const { projectSchema } = require("./Project"); 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  skills: {
    type: [String],
    default: [],
  },

  profilePhoto: { type: String, default: '/default-profile-photo.jpg' }, 

  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }], 


  profileType: { type: String, enum: ['Free', 'Paid'], default: 'Free' },

  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  // Add pendingConnections field for storing the connection requests
  pendingConnections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
});

module.exports = mongoose.model("User", userSchema);




