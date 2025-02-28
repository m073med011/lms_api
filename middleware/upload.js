const multer = require('multer');

// Use memory storage for quick processing (useful for Cloudinary uploads)
const storage = multer.memoryStorage();

// File Filter to allow only image uploads
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Multer Upload Configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Limit file size to 2MB
    }
});

module.exports = upload;
