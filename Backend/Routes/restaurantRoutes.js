const express = require('express');
const {
    createRestaurant,
    verifyRestaurantOtp,
    resendVerificationOtp,
    loginRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
} = require('../Controllers/restaurantController');

const router = express.Router();

router.post('/', createRestaurant);
router.post('/verify-otp', verifyRestaurantOtp);
router.post('/resend-otp', resendVerificationOtp);
router.post('/login', loginRestaurant);
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

module.exports = router;
