const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  goal: {
    type: Number,
    require: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    require: true,
  },
});

const Goal = mongoose.model("Goal", GoalSchema);

module.exports = Goal;
