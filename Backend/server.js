const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./Model/User"); // ⚠️ keep path EXACT
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- UTILITIES ---------- */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ---------- ROUTES ---------- */

// Create User (Register)
app.post("/user/create", async (req, res) => {
  try {
    const {
      name,
      regNum,
      email,
      phoneNumber,
      password,
      coreDomain,
      subDomain,
      position,
      address,
      socials,
      bio,
    } = req.body;

    //  Basic password validation
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    //  Prevent duplicate users
    const existingUser = await User.findOne({
      $or: [{ email }, { regNum }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email or registration number already exists",
      });
    }

    const user = new User({
      name,
      regNum,
      email,
      phoneNumber,
      password,
      coreDomain,
      subDomain,
      position,
      address,
      socials,
      bio,
    });

await user.save();

const token = generateToken(user._id);

res.status(201).json({
  message: "User registered successfully",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    regNum: user.regNum,
    coreDomain: user.coreDomain
  }
});
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Create Session (Login)
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        regNum: user.regNum,
        coreDomain: user.coreDomain,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (password never included)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
