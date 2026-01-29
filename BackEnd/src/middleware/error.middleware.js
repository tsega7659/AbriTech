const multer = require('multer');

/**
 * Global Error Handling Middleware
 * Catch and handle common errors (like Multer upload errors)
 */
const errorMiddleware = (err, req, res, next) => {
    // Check if it's a Multer error
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large. Maximum size allowed is 100MB.',
                error: 'File too large'
            });
        }
        return res.status(400).json({
            message: `Upload error: ${err.message}`,
            error: err.code
        });
    }

    // Handled general errors
    if (err.message && err.message.includes('Format not supported')) {
        return res.status(400).json({
            message: err.message,
            error: 'Unsupported format'
        });
    }

    // Default error handler for anything else
    console.error('[Error Middleware]:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
};

module.exports = errorMiddleware;
