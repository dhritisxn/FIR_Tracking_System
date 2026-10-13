const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { signToken } = authMiddleware;

// Slow down password guessing: 10 failed attempts per IP per 15 minutes on each login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many accounts created from this network. Please try again later." }
});

const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().email().max(254).required(),
  phoneNumber: Joi.string().trim().max(20).required(),
  password: Joi.string().min(8).max(128).required(),
  // Public sign-up can only ever create citizen accounts
  role: Joi.string().valid("citizen")
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  password: Joi.string().max(128).required()
});

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  profile: user.profile,
  createdAt: user.createdAt
});

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { name, email, phoneNumber, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
        field: "email"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "citizen", // Default role for registration
      profile: {
        address: "",
        idProof: "",
        avatarUrl: ""
      }
    });

    await user.save();

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Shared login handler; `role` restricts which accounts may use the route
const login = (role, invalidMessage) => async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const user = await User.findOne(role ? { email, role } : { email });

    // Same response whether the email or the password is wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: invalidMessage });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

router.post("/login", loginLimiter, login(null, "Invalid credentials"));
router.post("/admin/login", loginLimiter, login("admin", "Invalid admin credentials"));
router.post("/officer/login", loginLimiter, login("officer", "Invalid credentials"));

router.get("/me", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(publicUser(user));
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

module.exports = router;
