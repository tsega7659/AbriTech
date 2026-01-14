const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Dynamic Cloudinary upload middleware
 * @param {string} folderName - The folder in Cloudinary to store the image
 * @returns {multer.Instance} - Multer middleware instance
 */
const upload = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folderName,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            // transformation is optional, can be added if needed
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `${uniqueSuffix}-${file.originalname.split('.')[0]}`;
            }
        },
    });

    return multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|webp/;
            const isSupported = allowedTypes.test(file.mimetype) ||
                allowedTypes.test(file.originalname.toLowerCase());

            if (isSupported) {
                return cb(null, true);
            } else {
                cb(new Error('Only images are allowed (jpeg, jpg, png, webp)!'));
            }
        }
    });
};

module.exports = upload;
