const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Usage: set MONGO_URL, OFFICER_EMAIL and OFFICER_PASSWORD (optionally OFFICER_NAME,
// OFFICER_PHONE, OFFICER_BADGE, OFFICER_DEPARTMENT) in Backend/.env, then run
//   node scripts/createOfficer.js
const OFFICER_EMAIL = (process.env.OFFICER_EMAIL || 'sharma@police.gov.in').trim().toLowerCase();
const OFFICER_PASSWORD = process.env.OFFICER_PASSWORD;

const createOfficer = async () => {
    if (!process.env.MONGO_URL) {
        console.error('MONGO_URL is not set in Backend/.env');
        process.exit(1);
    }
    if (!OFFICER_PASSWORD || OFFICER_PASSWORD.length < 8) {
        console.error('Set OFFICER_PASSWORD (at least 8 characters) in Backend/.env');
        process.exit(1);
    }

    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URL.trim());
        console.log('Connected to MongoDB Atlas');

        // Check if officer already exists
        const existingOfficer = await User.findOne({ email: OFFICER_EMAIL });
        if (existingOfficer) {
            console.log(`A user with email ${OFFICER_EMAIL} already exists (role: ${existingOfficer.role})`);
            return;
        }

        // Create officer
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(OFFICER_PASSWORD, salt);

        const officer = new User({
            name: process.env.OFFICER_NAME || 'Officer Sharma',
            email: OFFICER_EMAIL,
            password: hashedPassword,
            phoneNumber: process.env.OFFICER_PHONE || '9876543210',
            role: 'officer',
            profile: {
                designation: 'Inspector',
                badgeNumber: process.env.OFFICER_BADGE || 'POL456',
                department: process.env.OFFICER_DEPARTMENT || 'Cyber Crime',
                address: 'Police Station, Sector 1',
                idProof: 'POLICE_ID_456'
            }
        });

        await officer.save();
        console.log(`Officer created successfully: ${OFFICER_EMAIL}`);
    } catch (error) {
        console.error('Error creating officer:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

createOfficer();
