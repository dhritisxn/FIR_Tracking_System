const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB connection with better error handling
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fir_system';


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
