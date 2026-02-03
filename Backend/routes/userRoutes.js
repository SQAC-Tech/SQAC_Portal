const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ---------- UTIL ---------- */
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ---------- REGISTER ---------- */
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

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Normalize
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

    const user = await User.create({
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

    const token = generateToken(user._id);

    // 🍪 session cookie
    res.cookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in prod
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

/* ---------- LOGIN ---------- */
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
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

/* ---------- CURRENT USER ---------- */
const getMe = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
};

/* ---------- LOGOUT ---------- */
const logoutUser = (req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logged out" });
};

module.exports = {
  createUser,
  loginUser,
  getMe,
  logoutUser,
};
