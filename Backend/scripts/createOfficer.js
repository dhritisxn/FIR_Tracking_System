const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createOfficer = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB Atlas');

        // Check if officer already exists
        const existingOfficer = await User.findOne({ email: 'sharma@police.gov.in' });
        if (existingOfficer) {
            console.log('Officer already exists');
            await mongoose.connection.close();
            return;
        }

        // Create officer
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('officer123', salt);

        const officer = new User({
            name: 'Officer Sharma',
            email: 'sharma@police.gov.in',
            password: hashedPassword,
            phoneNumber: '9876543210',
            role: 'officer',
            profile: {
                badgeNumber: 'POL456',
                department: 'Cyber Crime',
                rank: 'Inspector',
                joinDate: new Date(),
                address: 'Police Station, Sector 1',
                idProof: 'POLICE_ID_456'
            }
        });

        await officer.save();
        console.log('Officer created successfully');
        console.log('Officer Credentials:');
        console.log('Email: sharma@police.gov.in');
        console.log('Password: officer123');
        console.log('Role: officer');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating officer:', error);
        await mongoose.connection.close();
    }
};

createOfficer();
