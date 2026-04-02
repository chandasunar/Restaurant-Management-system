# Restaurant Management System Backend

This backend is built for a dine-in restaurant ordering system where customers scan a QR code, browse menu items, and place food orders from their table.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Nodemailer

## What This Backend Contains

- Restaurant registration and management APIs
- Email OTP verification for restaurant owners
- Restaurant login API
- Menu item management APIs
- Order management APIs
- Image upload support for menu item photos
- MongoDB data models for restaurants and menu items
- Static file serving for uploaded menu images

## Current Models

### Restaurant

Stores restaurant account and setup details:

- Name
- Address
- Email
- Phone
- Number of tables
- Password
- `isVerified`
- OTP and OTP expiry fields

### Menu

Stores menu items that belong to a restaurant:

- Restaurant reference
- Item name
- Description
- Category
- Type: `veg`, `non-veg`, `none`
- Price
- Image path
- Availability status
- Preparation time
- Spice level
- Tags

## How It Works

1. A restaurant is created using the restaurant API.
2. Menu items are created for that restaurant using the menu API.
3. A verification OTP is emailed to the restaurant owner.
4. The owner verifies the account before login is allowed.
5. Menu images are uploaded with `multipart/form-data` using Multer.
6. Uploaded images are stored in `Backend/uploads/menu`.
7. The image path is saved in MongoDB and served through `/uploads/...`.
8. The frontend can fetch restaurant, menu, and order data through REST endpoints.

## API Routes

### Restaurant Routes

- `POST /api/restaurants`
- `POST /api/restaurants/verify-otp`
- `POST /api/restaurants/resend-otp`
- `POST /api/restaurants/login`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`

### Menu Routes

- `POST /api/menu`
- `GET /api/menu`
- `GET /api/menu/:id`
- `PUT /api/menu/:id`
- `DELETE /api/menu/:id`

### Order Routes

- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`

## Menu Upload Request

To create or update a menu item with an image, send the request as `multipart/form-data`.

Expected fields:

- `restaurant`
- `name`
- `description`
- `category`
- `type`
- `price`
- `image`
- `isAvailable`
- `preparationTime`
- `spiceLevel`
- `tags`

`tags` can be sent as a comma-separated string such as `spicy,popular,chef-special`.

## Environment

The server uses these environment variables:

- `PORT`
- `MONGODB_URI`
- `MAIL_SERVICE`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`

If `MONGODB_URI` is not set, the backend uses:

`mongodb://127.0.0.1:27017/restaurant_management_system`

## Files Added and Updated

- `Models/Restaurant.js`
- `Models/Menu.js`
- `Models/Order.js`
- `Controllers/restaurantController.js`
- `Controllers/orderController.js`
- `Controllers/menuController.js`
- `Routes/restaurantRoutes.js`
- `Routes/orderRoutes.js`
- `Routes/menuRoutes.js`
- `Middleware/uploadMenuImage.js`
- `Utils/mailer.js`
- `server.js`
- `package.json`

## Notes

- Passwords are currently stored in plain text because authentication has not yet been upgraded to use hashing.
- Owner login is blocked until `isVerified` becomes `true`.
- Multer is required for image uploads. Run `npm install` inside `Backend` if dependencies are not installed yet.
- Use `.env.example` as the template for your backend environment file.
