const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Usage: set MONGO_URL, ADMIN_EMAIL and ADMIN_PASSWORD in Backend/.env, then run
//   node scripts/createAdmin.js
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@police.gov.in').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const createAdmin = async () => {
  if (!process.env.MONGO_URL) {
    console.error('MONGO_URL is not set in Backend/.env');
    process.exit(1);
  }
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error('Set ADMIN_PASSWORD (at least 8 characters) in Backend/.env');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL.trim());
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`A user with email ${ADMIN_EMAIL} already exists`);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = new User({
      name: 'Admin Officer',
      email: ADMIN_EMAIL,
      phoneNumber: '+91-9999999999',
      password: hashedPassword,
      role: 'admin',
      profile: {
        address: 'Police Headquarters',
        idProof: 'POLICE-ID-001',
        avatarUrl: ''
      }
    });

    await admin.save();
    console.log(`Admin user created successfully: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
