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
        params: async (req, file) => {
            // Check if file is a document (PDF, Word, etc.)
            const isRaw = file.mimetype === 'application/pdf' || 
                          file.mimetype.includes('msword') || 
                          file.mimetype.includes('officedocument') || 
                          file.originalname.toLowerCase().endsWith('.pdf');
            
            return {
                folder: folderName,
                resource_type: isRaw ? 'raw' : 'auto', 
                public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.split('.')[0]}`
            };
        },
    });

    return multer({
        storage: storage,
        limits: { fileSize: 200 * 1024 * 1024 }, // Increased to 200MB for videos
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
