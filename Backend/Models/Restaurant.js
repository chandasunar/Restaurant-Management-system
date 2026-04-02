const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        tables: {
            type: Number,
            default: 0,
            min: 0,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationOtp: {
            type: String,
            default: null,
        },
        verificationOtpExpiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;
