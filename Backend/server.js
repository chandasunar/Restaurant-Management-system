const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const restaurantRoutes = require('./Routes/restaurantRoutes');
const menuRoutes = require('./Routes/menuRoutes');
const orderRoutes = require('./Routes/orderRoutes');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_management_system';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    return next();
});

app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Restaurant backend is running.',
    });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

app.use((error, _req, res, _next) => {
    res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
    });
});

const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

startServer();
