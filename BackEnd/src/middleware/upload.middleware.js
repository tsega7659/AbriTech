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
            // Check if file is a document/archive (PDF, Word, RAR, ZIP, etc.)
            const isRaw = file.mimetype === 'application/pdf' ||
                file.mimetype.includes('msword') ||
                file.mimetype.includes('officedocument') ||
                file.mimetype === 'application/x-rar-compressed' ||
                file.mimetype === 'application/vnd.rar' ||
                file.mimetype === 'application/zip' ||
                file.mimetype === 'application/x-zip-compressed' ||
                file.mimetype === 'application/octet-stream' ||
                file.originalname.toLowerCase().endsWith('.pdf') ||
                file.originalname.toLowerCase().endsWith('.rar') ||
                file.originalname.toLowerCase().endsWith('.zip');

            return {
                folder: folderName,
                resource_type: isRaw ? 'raw' : 'auto',
                public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}-${isRaw ? file.originalname : file.originalname.split('.').slice(0, -1).join('.') || file.originalname}`
            };
        },
    });

    return multer({
        storage: storage,
        limits: { fileSize: 200 * 1024 * 1024 }, // Increased to 200MB for videos
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|webp|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|video|rar|x-rar|zip|x-zip-compressed|octet-stream/;
            const isRarFile = file.originalname.toLowerCase().endsWith('.rar');
            const isZipFile = file.originalname.toLowerCase().endsWith('.zip');
            const isSupported = allowedTypes.test(file.mimetype) ||
                allowedTypes.test(file.originalname.toLowerCase()) ||
                isRarFile || isZipFile;

            if (isSupported) {
                return cb(null, true);
            } else {
                cb(new Error('Format not supported! (Allowed: Images, PDF, Doc, Video, RAR, ZIP)'));
            }
        }
    });
};

module.exports = upload;
