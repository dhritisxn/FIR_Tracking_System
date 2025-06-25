const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const officersData = [
    {
        name: 'Inspector Singh',
        email: 'singh@police.gov.in',
        phoneNumber: '9876543211',
        designation: 'Inspector',
        badgeNumber: 'IN789',
        jurisdiction: 'Cyber Crime'
    },
    {
        name: 'Constable Kumar',
        email: 'kumar@police.gov.in',
        phoneNumber: '9876543212',
        designation: 'Constable',
        badgeNumber: 'CN456',
        jurisdiction: 'Traffic'
    },
    {
        name: 'Constable Verma',
        email: 'verma@police.gov.in',
        phoneNumber: '9876543213',
        designation: 'Constable',
        badgeNumber: 'CN457',
        jurisdiction: 'Local Beat'
    }
];

const createOfficers = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB Atlas');

        const password = 'officer123'; // Same password for all officers for simplicity
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        for (const officerData of officersData) {
            // Check if officer already exists
            const existingOfficer = await User.findOne({ email: officerData.email });
            if (existingOfficer) {
                console.log(`Officer with email ${officerData.email} already exists`);
                continue;
            }

            // Create new officer
            const officer = new User({
                name: officerData.name,
                email: officerData.email,
                password: hashedPassword,
                phoneNumber: officerData.phoneNumber,
                role: 'officer',
                profile: {
                    designation: officerData.designation,
                    badgeNumber: officerData.badgeNumber,
                    jurisdiction: officerData.jurisdiction,
                    joiningDate: new Date(),
                    department: 'Police Department'
                }
            });

            await officer.save();
            console.log(`Created officer: ${officerData.name}`);
        }

        console.log('All officers created successfully');
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('Error creating officers:', error);
        await mongoose.connection.close();
    }
};

createOfficers();
