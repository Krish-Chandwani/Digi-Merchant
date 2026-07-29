const mongoose = require('mongoose');

const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        const { ensureDefaultCoupons } = require('../utils/couponUtils');
        await ensureDefaultCoupons();
        console.log('Default coupons ready');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;