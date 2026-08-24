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

    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = err.status || (err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500);

    // Sanitize database/system error messages in production
    let clientMessage = err.message || 'Something went wrong on the server';
    const isSensitiveInternalError = statusCode >= 500 || 
        /syntax error|violates|foreign key|constraint|column.*does not exist|select.*from/i.test(String(clientMessage));

    if (isProduction && isSensitiveInternalError) {
        clientMessage = 'An internal server error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        success: false,
        message: clientMessage,
        ...(isProduction ? {} : { stack: err.stack, rawError: err.message })
    });
};

module.exports = errorMiddleware;
