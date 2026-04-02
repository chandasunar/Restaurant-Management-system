const mongoose = require('mongoose');
const Order = require('../Models/Order');

const allowedStatuses = ['new', 'pending', 'accepted', 'served', 'completed', 'cancelled'];

const createOrder = async (req, res) => {
    try {
        const {
            restaurant,
            tableNumber,
            qrCodeValue,
            customerName,
            items,
            subtotal,
            taxAmount,
            serviceCharge,
            totalAmount,
            specialInstructions,
            paymentStatus,
            status,
        } = req.body;

        if (!restaurant || !tableNumber || !Array.isArray(items) || items.length === 0 || subtotal === undefined || totalAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant, table number, items, subtotal, and total amount are required.',
            });
        }

        const order = await Order.create({
            restaurant,
            tableNumber,
            qrCodeValue,
            customerName,
            items,
            subtotal,
            taxAmount,
            serviceCharge,
            totalAmount,
            specialInstructions,
            paymentStatus,
            status,
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully.',
            data: order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create order.',
            error: error.message,
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const { restaurant, status } = req.query;
        const query = {};

        if (restaurant) {
            if (!mongoose.Types.ObjectId.isValid(restaurant)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid restaurant id.',
                });
            }

            query.restaurant = restaurant;
        }

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name email')
            .populate('items.menuItem', 'name category type price');

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders.',
            error: error.message,
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order id.',
            });
        }

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(', ')}.`,
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('restaurant', 'name email')
            .populate('items.menuItem', 'name category type price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully.',
            data: order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update order status.',
            error: error.message,
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
};
