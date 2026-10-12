const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

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

app.use(express.json());

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
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

module.exports = app;
