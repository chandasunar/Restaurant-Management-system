const mongoose = require('mongoose');
const Restaurant = require('../Models/Restaurant');
const { sendVerificationOtpEmail } = require('../Utils/mailer');

const OTP_EXPIRY_IN_MINUTES = 10;

const sanitizeRestaurant = (restaurant) => {
    const restaurantObject = restaurant.toObject ? restaurant.toObject() : restaurant;
    const { password, __v, verificationOtp, verificationOtpExpiresAt, ...safeRestaurant } = restaurantObject;
    return safeRestaurant;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const createOtpPayload = () => ({
    verificationOtp: generateOtp(),
    verificationOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_IN_MINUTES * 60 * 1000),
});

const sendRestaurantVerificationOtp = async (restaurant) => {
    await sendVerificationOtpEmail({
        email: restaurant.email,
        restaurantName: restaurant.name,
        otp: restaurant.verificationOtp,
    });
};

const createRestaurant = async (req, res) => {
    try {
        const { name, address, email, phone, tables, password } = req.body;

        if (!name || !address || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, address, email, phone, and password are required.',
            });
        }

        const normalizedEmail = email.toLowerCase();
        const existingRestaurant = await Restaurant.findOne({
            $or: [{ email: normalizedEmail }, { phone }],
        });

        if (existingRestaurant) {
            return res.status(409).json({
                success: false,
                message: 'Restaurant already exists with this email or phone.',
            });
        }

        const otpPayload = createOtpPayload();

        const restaurant = await Restaurant.create({
            name,
            address,
            email: normalizedEmail,
            phone,
            tables,
            password,
            ...otpPayload,
        });

        await sendRestaurantVerificationOtp(restaurant);

        return res.status(201).json({
            success: true,
            message: 'Restaurant created successfully. Verification OTP sent to email.',
            data: sanitizeRestaurant(restaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create restaurant.',
            error: error.message,
        });
    }
};

const verifyRestaurantOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required.',
            });
        }

        const restaurant = await Restaurant.findOne({ email: email.toLowerCase() });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        if (restaurant.isVerified) {
            return res.status(200).json({
                success: true,
                message: 'Restaurant already verified.',
                data: sanitizeRestaurant(restaurant),
            });
        }

        if (!restaurant.verificationOtp || restaurant.verificationOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.',
            });
        }

        if (!restaurant.verificationOtpExpiresAt || restaurant.verificationOtpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired. Please request a new OTP.',
            });
        }

        restaurant.isVerified = true;
        restaurant.verificationOtp = null;
        restaurant.verificationOtpExpiresAt = null;
        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: 'Restaurant verified successfully.',
            data: sanitizeRestaurant(restaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to verify restaurant.',
            error: error.message,
        });
    }
};

const resendVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.',
            });
        }

        const restaurant = await Restaurant.findOne({ email: email.toLowerCase() });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        if (restaurant.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant is already verified.',
            });
        }

        Object.assign(restaurant, createOtpPayload());
        await restaurant.save();
        await sendRestaurantVerificationOtp(restaurant);

        return res.status(200).json({
            success: true,
            message: 'Verification OTP resent successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to resend OTP.',
            error: error.message,
        });
    }
};

const loginRestaurant = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const restaurant = await Restaurant.findOne({ email: email.toLowerCase() });

        if (!restaurant || restaurant.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (!restaurant.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Restaurant email is not verified yet.',
                requiresVerification: true,
                data: sanitizeRestaurant(restaurant),
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: sanitizeRestaurant(restaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to login restaurant.',
            error: error.message,
        });
    }
};

const getRestaurants = async (_req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants.map(sanitizeRestaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants.',
            error: error.message,
        });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant id.',
            });
        }

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: sanitizeRestaurant(restaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant.',
            error: error.message,
        });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant id.',
            });
        }

        const updates = { ...req.body };

        if (updates.email) {
            updates.email = updates.email.toLowerCase();
        }

        const duplicateQuery = [];

        if (updates.email) {
            duplicateQuery.push({ email: updates.email });
        }

        if (updates.phone) {
            duplicateQuery.push({ phone: updates.phone });
        }

        if (duplicateQuery.length > 0) {
            const duplicateRestaurant = await Restaurant.findOne({
                _id: { $ne: id },
                $or: duplicateQuery,
            });

            if (duplicateRestaurant) {
                return res.status(409).json({
                    success: false,
                    message: 'Another restaurant already uses this email or phone.',
                });
            }
        }

        const restaurant = await Restaurant.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully.',
            data: sanitizeRestaurant(restaurant),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update restaurant.',
            error: error.message,
        });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant id.',
            });
        }

        const restaurant = await Restaurant.findByIdAndDelete(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete restaurant.',
            error: error.message,
        });
    }
};

module.exports = {
    createRestaurant,
    verifyRestaurantOtp,
    resendVerificationOtp,
    loginRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
};
