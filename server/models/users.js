const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  blockExpires: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "user",
  },
  resetToken: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
