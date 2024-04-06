const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const multer = require("multer");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// models
const User = require("./models/users");
const Transaction = require("./models/transaction");
const Lesson = require("./models/lessons");
const Goal = require("./models/goals");

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.68.105:3000",
      "192.168.68.105:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

function generateToken() {
  return crypto.randomBytes(3).toString("hex");
}

// send new blog post email
async function sendEmail(
  userEmail,
  userName,
  lessonName,
  lessonImage,
  lessonSummary,
  lessonId
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const truncateText = (text, length) => {
    if (text.length <= length) {
      return text;
    }
    return text.slice(0, length) + "...";
  };

  const truncatedLessonSummary = truncateText(lessonSummary, 300);

  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Don't Miss Out on Our Latest Blog Post!",
    text: `Hello ${userName}, we have a new blog post for you. ${lessonName}`,
    html: ` <div style="font-family: Arial, sans-serif; color: #333;" background-color: white; border-radius: 15px>
      <h3 style="color: #2c62b1;">New blog post</h3>
      <h1 style="font-size: 24px;">${lessonName}</h1>
      <img src='http://localhost:3001/uploads/${lessonImage}' alt="blog image" style="width: 100%; max-width: 600px; object-fit: cover" />      
        ${truncatedLessonSummary}<br><br>

      <a href="http://localhost:3000/lesson-post/${lessonId}" style="padding: 12px 24px !important;
      display: inline-block;
      background-color: #2c62b1;
      font-size: 15px;
      color: white;
      font-weight: 600;
      border: none;
      outline: none;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;">Read post</a>
    </div>`,
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent");
    }
  });
}

async function sendToken(emailadres, name, resetUrl) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: emailadres,
    subject: "Reset Password token",
    html: `
      <p>Hello ${name},</p>
      <p>You are receiving this because you have requested the reset of the password for your account.</p>
      <p>Please use the following token to reset your password:</p>
      <div style="padding: 5px 40px; background-color: #2c62b1; width: fit-content; font-size: 1.5em; font-weight: bold;">${resetUrl}</div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `,
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent");
    }
  });
}

// send email when user is blocked
async function sendBlockedEmail(emailadres, username) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: emailadres,
    subject: "Your account has been blocked",
    html: `<p>Hello ${username},\n\nYour account has been blocked because you entered failed login details too many times. You cannot log in again for more than 24 hours</p>`,
  };

  await transporter.sendMail(mailOptions);
  console.log("email sent");
}

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      resetToken: "",
    });
    await user.save();

    return res.json({
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("email doesnt exist ");
      return res.status(400).json({
        message: "Email doesnt exist",
      });
    }

    if (user.blocked && Date.now() < user.blockExpires) {
      return res.status(400).json({ message: "User is blocked" });
    }

    if (user.failedAttempts >= 3) {
      console.log("user is blocked");
      const email = user.email;
      const blockDuration = 24 * 60 * 1000; // 24 hours
      const blockExpires = Date.now() + blockDuration;
      const emailadres = user.email;
      const username = user.name;
      console.log(email, username);

      sendBlockedEmail(emailadres, username);
      await User.collection.updateOne(
        { email: email },
        {
          $set: {
            blocked: true,
            blockExpires: blockExpires,
            failedAttempts: 0,
          },
        }
      );

      return res.status(400).json({ message: "User is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await User.updateOne({ email }, { $inc: { failedAttempts: 1 } });
      return res.status(400).json({ message: "Password is incorrect" });
    }
    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.name = user.name;

    req.session.save((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "An error occurred" });
      }
      return res.json({ message: "Login successful!" });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/api/check-login", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email, resetToken } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email doesn't exist",
      });
    }

    const token = generateToken();
    user.resetToken = token;
    await user.save();

    const resetUrl = `http://localhost:3000/new-password?token=${token}`;
    sendToken(email, resetUrl);

    return res.json({ message: "Token send successful!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/verify", async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ resetToken: token });
  if (!user) {
    return res.status(404).json({ message: "Invalid token" });
  }

  user.resetToken = undefined;
  await user.save();

  res.json({ message: "User verified successfully" });
});

app.post("/new-password", async (req, res) => {
  const { resetToken, password } = req.body;

  console.log(resetToken, "resetToken");

  if (!password || password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const user = await User.findOne({ resetToken });
    console.log(user, "user");
    if (!user) {
      return res.status(404).json({ message: "Invalid reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;

    user.markModified("password");
    user.markModified("resetToken");

    const updatedUser = await user.save();
    console.log(updatedUser);

    return res.json({ message: "New password created successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred" });
    } else {
      res.send("logged out successfully!");
    }
  });
});

app.post("/update-profile", async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken && String(emailTaken._id) !== String(user._id)) {
      return res.status(400).json({ message: "Email already in use" });
    }
  }

  if (name) {
    user.name = name;
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
  }

  if (name) {
    user.name = name;
  }

  if (!name || !email) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  await user.save();

  try {
    await user.save();

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    req.session.name = user.name;
    req.session.email = user.email;
    console.log(req.session.user);

    return res.json({
      message: "Update successful!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-profile", (req, res) => {
  res.json({ name: req.session.name, email: req.session.email });
});

app.post("/create-transaction", async (req, res) => {
  const { from, type, date, amount } = req.body;
  const userId = req.session.userId;
  console.log(userId, "userId");
  if (!from || !type || !amount) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const date = new Date();
    const transaction = new Transaction({ from, type, date, amount, userId });
    await transaction.save();
    console.log(transaction);
    return res.json({
      message: "Transaction created successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-transaction", async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await Transaction.find({ userId: userId });
    res.json(transactions);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.delete("/delete-transaction/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Transaction.findByIdAndDelete(id);
    res.json({ message: "Transaction deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.put("/update-transaction/:id", async (req, res) => {
  const id = req.params.id;
  const { from, type, date, amount } = req.body;

  if (!from || !type || !amount) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    await Transaction.findByIdAndUpdate(id, { from, type, date, amount });
    res.json({ message: "Transaction updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-transaction-info/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });
    const transactionsInfo = {
      from: transaction.from,
      type: transaction.type,
      date: transaction.date,
      amount: transaction.amount,
    };
    console.log(transactionsInfo);
    res.json(transactionsInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-transaction-total", async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await Transaction.find({ userId: userId });
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += Number(transaction.amount);
      } else {
        totalExpense += Number(transaction.amount);
      }
    });

    let totalSavings = 0;

    const goals = await Goal.find({ userId: userId });
    goals.forEach((goal) => {
      totalSavings += Number(goal.price);
    });

    res.json({ totalIncome, totalExpense, totalSavings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/user-role", async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.post("/create-lesson", upload.single("image"), async (req, res) => {
  const { title, blogContent } = req.body;
  const image = req.file.filename;
  console.log(req.body, "req.body");
  console.log(req.file, "req.file");

  if (!image || !title || !blogContent) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const lessonImage = image;
  const lessonName = title;
  const lessonSummary = blogContent;
  const lessonId = req.session.lesson_id;

  try {
    const lesson = new Lesson({
      img: image,
      title,
      blogContent,
      date: new Date(),
    });

    req.session.lesson_id = lesson._id;
    console.log(req.session.lesson_id, "lesson_id");

    await lesson.save();
    const allUsers = await User.find();
    console.log(allUsers, "allUsers");

    // allUsers.forEach(async (user) => {
    //   if (user.role !== "admin") {
    //     await sendEmail(
    //       user.email,
    //       user.name,
    //       lessonName,
    //       lessonImage,
    //       lessonSummary,
    //       lessonId
    //     );
    //   }
    // });
    console.log(lesson);
    return res.json({
      message: "Lesson created successfully! and email sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-images", async (req, res) => {
  const lesson = await Lesson.find();
  res.json(lesson);
});

app.get("/get-lesson", async (req, res) => {
  try {
    const lesson = await Lesson.find();
    res.json(lesson);
  } catch (error) {
    console.log(error);
    return res.status(500).jsons({
      message: "An error occurred",
    });
  }
});

app.get("/get-lesson-info/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.id,
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const prevLesson = await Lesson.findOne({
      _id: { $lt: lesson._id },
    }).sort({ _id: -1 });

    const nextLesson = await Lesson.findOne({
      _id: { $gt: lesson._id },
    }).sort({ _id: 1 });

    const lessonInfo = {
      img: lesson.img,
      title: lesson.title,
      blogContent: lesson.blogContent,
      date: lesson.date,
      prevId: prevLesson ? prevLesson._id : null,
      nextId: nextLesson ? nextLesson._id : null,
    };

    res.json(lessonInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.put("/update-lesson/:id", upload.single("image"), async (req, res) => {
  console.log("testing");
  const id = req.params.id;

  let image = req.file ? req.file.filename : req.body.image;

  const { title, blogContent } = req.body;

  console.log(req.body, "req.body");

  if (!image || !title || !blogContent) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    await Lesson.findByIdAndUpdate(id, {
      img: image,
      title,
      blogContent,
      date: new Date(),
    });
    res.json({ message: "Lesson updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

const fs = require("fs");

app.delete("/delete-lesson/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const lesson = await Lesson.findById(id);
    if (lesson) {
      const imgPath = path.join(__dirname, "uploads", lesson.img);
      fs.unlinkSync(imgPath);
      await Lesson.findByIdAndDelete(id);
      res.json({ message: "Lesson deleted successfully!" });
    } else {
      res.status(404).json({ message: "Lesson not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-users", async (req, res) => {
  try {
    const users = await User.find();
    const lesson = await Lesson.find();
    res.json({ lesson, users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});
app.get("/income-expenses", async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await Transaction.find({ userId: userId });
    let monthlyData = {};

    transactions.forEach((transaction) => {
      const month = transaction.date.getMonth() + 1; // JavaScript months are 0-indexed
      const amount = transaction.amount;
      const type = transaction.type; // 'income' or 'expenses'

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (type === "income") {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expenses += amount;
      }
    });

    // Transform the monthlyData object into an array for easy charting
    const chartData = Object.keys(monthlyData).map((month) => ({
      month: parseInt(month),
      income: monthlyData[month].income,
      expenses: monthlyData[month].expenses,
    }));

    res.json(chartData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.post("/create-goal", async (req, res) => {
  const { title, price, goal } = req.body;
  const userId = req.session.userId;

  if (!title || !price || !goal) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const goals = new Goal({ title, price, goal, userId });
    await goals.save();
    return res.json({
      message: "Goal created successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/fetch-goals", async (req, res) => {
  try {
    const userId = req.session.userId;
    const goals = await Goal.find({ userId: userId });
    res.json(goals);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.get("/get-goal/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    const goal = await Goal.findOne({ _id: req.params.id, userId: userId });

    const goalInfo = {
      id: goal._id,
      title: goal.title,
      price: goal.price,
      goal: goal.goal,
    };
    res.json(goalInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.put("/update-goal/:id", async (req, res) => {
  const { title, price, goal } = req.body;
  const id = req.params.id;
  console.log(id, title, price, goal);
  if (!title || !price || !goal) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    await Goal.findByIdAndUpdate(id, { title, price, goal });
    res.json({ message: "Goal updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.put("/mark-goal-as-completed/:id", async (req, res) => {
  const { completed, price } = req.body;
  const id = req.params.id;

  if (completed === undefined || price === undefined) {
    return res.status(400).json({
      message: "Both completed status and price are required",
    });
  }

  try {
    await Goal.findByIdAndUpdate(id, { completed, price });
    res.json({ message: "Goal updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.delete("/delete-goal/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Goal.findByIdAndDelete(id);
    res.json({ message: "Goal deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
