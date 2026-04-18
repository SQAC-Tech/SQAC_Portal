import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'
import { createUser, loginUser, logoutUser, authicateTOken } from './Controller/User.controller.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.post("/user/create", createUser);
app.post("/user/login", loginUser);
app.post("/logout", logoutUser);

connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
