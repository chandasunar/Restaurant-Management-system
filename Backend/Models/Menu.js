const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['veg', 'non-veg', 'none'],
            default: 'none',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            default: '',
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        preparationTime: {
            type: Number,
            default: 0,
            min: 0,
        },
        spiceLevel: {
            type: String,
            enum: ['none', 'mild', 'medium', 'hot'],
            default: 'none',
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

MenuSchema.index({ restaurant: 1, category: 1 });
MenuSchema.index({ restaurant: 1, name: 1 }, { unique: true });

const Menu = mongoose.model('Menu', MenuSchema);

module.exports = Menu;
