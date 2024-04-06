const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  img: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  blogContent: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
});

const Lesson = mongoose.model("Lesson", LessonSchema);
module.exports = Lesson;
