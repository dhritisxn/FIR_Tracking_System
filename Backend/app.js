const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { getJwtSecret } = require("./middleware/auth");

dotenv.config();

// Refuse to start without a strong JWT secret (throws with a clear message)
getJwtSecret();

const app = express();

// Render sits behind one proxy; needed so rate limiting sees the real client IP
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // local dev
    'https://fir-tracking-system-frontend.onrender.com', // deployed frontend
    'https://fir-tracking-system-frontend-isxk.onrender.com', // Render frontend (dhritisxn)
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Cap request bodies so oversized payloads are rejected early
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// Broad per-IP limit across the API; login has a stricter limiter of its own
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." }
}));

// MongoDB connection with better error handling
// Tolerate common paste mistakes: surrounding whitespace/quotes, a "MONGO_URL=" prefix, "mongodb-srv"
const MONGO_URL = (process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fir_system')
  .trim()
  .replace(/^(MONGO_URL|MONGODB_URI)\s*=\s*/i, '')
  .replace(/^["']|["']$/g, '')
  .replace(/^mongodb-srv:\/\//i, 'mongodb+srv://');

// Log the connection target with credentials masked, to help diagnose bad values
console.log('MongoDB target:', MONGO_URL.replace(/\/\/.*@/, '//***@'));

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if can't connect to database
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use("/api", require("./routes/firRoutes"));
app.use("/api/police", require("./routes/police"));
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api/user", require("./routes/user"));
app.use("/api/docs", require("./routes/swagger"));
app.use("/api/notifications", require("./routes/notifications"));

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Error:', err.message);
  // Don't leak internal error details to clients
  res.status(status).json({ error: status >= 500 ? 'Something went wrong!' : err.message });
});

module.exports = app;
