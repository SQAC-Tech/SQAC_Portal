const express = require("express");
const mongoose = require("mongoose");
const User = require("./Model/User");
const app = express();
require("dotenv").config();

// Middleware
app.use(express.json());
app.post("/user/create", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({
      message: "User stored successfully",
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch users"
    });
  }
});

mongoose
  .connect(process.env.MONGO_URI
)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log("Server running on port 5000");
});