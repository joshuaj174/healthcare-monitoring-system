const path     = require('path');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');

// Go up one level from scripts/ to server/ where .env lives
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found ✓' : 'NOT FOUND ✗');

const User = require('../models/User');

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('.env not loaded — MONGO_URI is undefined');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('Connected to MongoDB ✓');

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists!');
      await mongoose.connection.close();
      process.exit(0);
    }

    const salt    = await bcrypt.genSalt(10);
    const hashed  = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    await User.create({
      username: process.env.ADMIN_USERNAME,
      email:    process.env.ADMIN_EMAIL,
      password: hashed,
      role:     'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('Email:   ', process.env.ADMIN_EMAIL);
    console.log('Password:', process.env.ADMIN_PASSWORD);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createAdmin();