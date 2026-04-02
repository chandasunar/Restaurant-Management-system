const mongoose = require('mongoose');
const Menu = require('../Models/Menu');
const Restaurant = require('../Models/Restaurant');

const allowedTypes = ['veg', 'non-veg', 'none'];
const allowedSpiceLevels = ['none', 'mild', 'medium', 'hot'];

const parseTags = (tags) => {
    if (!tags) {
        return [];
    }

    if (Array.isArray(tags)) {
        return tags.map((tag) => String(tag).trim()).filter(Boolean);
    }

    return String(tags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const buildImagePath = (req) => {
    if (!req.file) {
        return '';
    }

    return `/uploads/menu/${req.file.filename}`;
};

const createMenuItem = async (req, res) => {
    try {
        const {
            restaurant,
            name,
            description,
            category,
            type,
            price,
            isAvailable,
            preparationTime,
            spiceLevel,
            tags,
        } = req.body;

        if (!restaurant || !name || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant, name, category, and price are required.',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant id.',
            });
        }

        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be veg, non-veg, or none.',
            });
        }

        if (spiceLevel && !allowedSpiceLevels.includes(spiceLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Spice level must be none, mild, medium, or hot.',
            });
        }

        const restaurantExists = await Restaurant.exists({ _id: restaurant });

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.',
            });
        }

        const duplicateMenu = await Menu.findOne({
            restaurant,
            name: name.trim(),
        });

        if (duplicateMenu) {
            return res.status(409).json({
                success: false,
                message: 'This restaurant already has a menu item with the same name.',
            });
        }

        const menuItem = await Menu.create({
            restaurant,
            name,
            description,
            category,
            type,
            price,
            image: buildImagePath(req),
            isAvailable,
            preparationTime,
            spiceLevel,
            tags: parseTags(tags),
        });

        return res.status(201).json({
            success: true,
            message: 'Menu item created successfully.',
            data: menuItem,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create menu item.',
            error: error.message,
        });
    }
};

const getMenuItems = async (req, res) => {
    try {
        const { restaurant, category, type, available } = req.query;
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

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (available !== undefined) {
            query.isAvailable = available === 'true';
        }

        const menuItems = await Menu.find(query)
            .populate('restaurant', 'name address email phone tables')
            .sort({ category: 1, name: 1 });

        return res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items.',
            error: error.message,
        });
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid menu item id.',
            });
        }

        const menuItem = await Menu.findById(id).populate('restaurant', 'name address email phone tables');

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: menuItem,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch menu item.',
            error: error.message,
        });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid menu item id.',
            });
        }

        const existingMenuItem = await Menu.findById(id);

        if (!existingMenuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.',
            });
        }

        const updates = { ...req.body };

        if (updates.restaurant && !mongoose.Types.ObjectId.isValid(updates.restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant id.',
            });
        }

        if (updates.type && !allowedTypes.includes(updates.type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be veg, non-veg, or none.',
            });
        }

        if (updates.spiceLevel && !allowedSpiceLevels.includes(updates.spiceLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Spice level must be none, mild, medium, or hot.',
            });
        }

        if (updates.tags !== undefined) {
            updates.tags = parseTags(updates.tags);
        }

        if (req.file) {
            updates.image = buildImagePath(req);
        }

        const duplicateRestaurantId = updates.restaurant || String(existingMenuItem.restaurant);
        const duplicateName = updates.name ? updates.name.trim() : existingMenuItem.name;

        const duplicateMenu = await Menu.findOne({
            _id: { $ne: id },
            restaurant: duplicateRestaurantId,
            name: duplicateName,
        });

        if (duplicateMenu) {
            return res.status(409).json({
                success: false,
                message: 'This restaurant already has a menu item with the same name.',
            });
        }

        const menuItem = await Menu.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate('restaurant', 'name address email phone tables');

        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully.',
            data: menuItem,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update menu item.',
            error: error.message,
        });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid menu item id.',
            });
        }

        const menuItem = await Menu.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete menu item.',
            error: error.message,
        });
    }
};

module.exports = {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
};
