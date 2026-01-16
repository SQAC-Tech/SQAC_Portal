const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./Model/User"); // ⚠️ keep this EXACT (Model vs models)
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());            // ✅ allows frontend requests
app.use(express.json());    // ✅ parses JSON body

/* ---------- ROUTES ---------- */

// Create user
app.post("/user/create", async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      message: "User stored successfully",
      user,
    });
  } catch (error) {
    console.error("SAVE ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Test route (VERY IMPORTANT FOR DEBUG)
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* ---------- SERVER ---------- */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
