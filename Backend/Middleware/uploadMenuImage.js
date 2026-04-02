const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'menu');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const safeName = path
            .basename(file.originalname, extension)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        cb(null, `${Date.now()}-${safeName || 'menu-item'}${extension}`);
    },
});

const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }

    return cb(new Error('Only image uploads are allowed.'));
};

const uploadMenuImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});

module.exports = uploadMenuImage;
