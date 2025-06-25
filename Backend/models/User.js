const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["citizen", "admin", "officer"],
    default: "citizen"
  },  profile: {
    address: {
      type: String,
      default: ""
    },
    designation: {
      type: String,
      default: ""
    },
    badgeNumber: {
      type: String,
      default: ""
    },
    jurisdiction: {
      type: String,
      default: ""
    },
    department: {
      type: String,
      default: "Police Department"
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    idProof: {
      type: String,
      default: ""
    },
    avatarUrl: {
      type: String,
      default: ""
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
