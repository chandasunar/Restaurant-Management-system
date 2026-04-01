const mongoose = require('mongoose');

const RestaurantSchema = mongoose.Schema({
    name: {Type: String, trim: true},
    address: {Type: String},
    email: {Type: String, unique: true},
    phone: {Type: String, unique: true},
    tables: {Type: Number, default: 0},

})

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;