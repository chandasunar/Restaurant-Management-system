const express = require('express');
const {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
} = require('../Controllers/menuController');
const uploadMenuImage = require('../Middleware/uploadMenuImage');

const router = express.Router();

router.post('/', uploadMenuImage.single('image'), createMenuItem);
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.put('/:id', uploadMenuImage.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;
