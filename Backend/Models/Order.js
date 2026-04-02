const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        itemType: {
            type: String,
            enum: ['veg', 'non-veg', 'none'],
            default: 'none',
        },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        tableNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        qrCodeValue: {
            type: String,
            trim: true,
            default: '',
        },
        customerName: {
            type: String,
            trim: true,
            default: 'Guest',
        },
        items: {
            type: [OrderItemSchema],
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: 'At least one item is required in an order.',
            },
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        taxAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        serviceCharge: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        specialInstructions: {
            type: String,
            trim: true,
            default: '',
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'pending', 'paid'],
            default: 'unpaid',
        },
        status: {
            type: String,
            enum: ['new', 'pending', 'accepted', 'served', 'completed', 'cancelled'],
            default: 'new',
        },
    },
    {
        timestamps: true,
    }
);

OrderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, tableNumber: 1, createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
