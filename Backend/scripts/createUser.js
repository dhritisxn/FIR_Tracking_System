const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Usage: set MONGO_URL, USER_NAME, USER_EMAIL, USER_PHONE and USER_PASSWORD in Backend/.env, then run
//   node scripts/createUser.js
// Creates a citizen account, same as signing up on the site.
const USER_NAME = (process.env.USER_NAME || '').trim();
const USER_EMAIL = (process.env.USER_EMAIL || '').trim().toLowerCase();
const USER_PHONE = (process.env.USER_PHONE || '').trim();
const USER_PASSWORD = process.env.USER_PASSWORD;

const createUser = async () => {
    if (!process.env.MONGO_URL) {
        console.error('MONGO_URL is not set in Backend/.env');
        process.exit(1);
    }
    if (!USER_NAME || !USER_EMAIL || !USER_PHONE) {
        console.error('Set USER_NAME, USER_EMAIL and USER_PHONE in Backend/.env');
        process.exit(1);
    }
    if (!USER_PASSWORD || USER_PASSWORD.length < 8) {
        console.error('Set USER_PASSWORD (at least 8 characters) in Backend/.env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URL.trim());
        console.log('Connected to MongoDB Atlas');

        const existingUser = await User.findOne({ email: USER_EMAIL });
        if (existingUser) {
            console.log(`A user with email ${USER_EMAIL} already exists (role: ${existingUser.role})`);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(USER_PASSWORD, salt);

        const user = new User({
            name: USER_NAME,
            email: USER_EMAIL,
            phoneNumber: USER_PHONE,
            password: hashedPassword,
            role: 'citizen',
            profile: {
                address: '',
                idProof: '',
                avatarUrl: ''
            }
        });

        await user.save();
        console.log(`User created successfully: ${USER_EMAIL}`);
    } catch (error) {
        console.error('Error creating user:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

createUser();
