import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
dotenv.config();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.session;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid session" });
    }
}

const createUser = async (req, res) => {
  try {
    let {
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

    if (!name || !regNum || !email || !password || !coreDomain) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    email = email.trim().toLowerCase();
    regNum = regNum.trim();

    const existingUser = await User.findOne({
      $or: [{ email }, { regNum }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email or registration number already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 15);

    const user = await User.create({
      name,
      regNum,
      email,
      phoneNumber,
      password: hashedPassword,
      coreDomain,
      subDomain,
      position,
      address,
      socials,
      bio,
    });


    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        regNum: user.regNum,
        coreDomain: user.coreDomain,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password} = req.body;

    email = email?.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        regNum: user.regNum,
        coreDomain: user.coreDomain,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logged out" });
};

const getrole = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        res.json({ role: req.user.role });
    } catch (error) {
        console.error("GET ROLE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export { createUser, loginUser, logoutUser, authenticateToken, getrole};
