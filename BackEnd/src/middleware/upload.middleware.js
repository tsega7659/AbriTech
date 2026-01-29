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
            resource_type: 'auto', // Support non-image files like PDF and Video
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'mp4', 'mkv'],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `${uniqueSuffix}-${file.originalname.split('.')[0]}`;
            }
        },
    });

    return multer({
        storage: storage,
        limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB for videos
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|webp|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|video/;
            const isSupported = allowedTypes.test(file.mimetype) ||
                allowedTypes.test(file.originalname.toLowerCase());

            if (isSupported) {
                return cb(null, true);
            } else {
                cb(new Error('Format not supported! (Allowed: Images, PDF, Doc, Video)'));
            }
        }
    });
};

module.exports = upload;
