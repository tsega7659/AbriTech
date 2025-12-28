// src/middleware/dbInitMiddleware.js
const { ensureTablesExist } = require('../utils/dbInit');

/**
 * Middleware that ensures the database is initialized before processing the request.
 * This will hanya wait for initialization on the first request that hits an API route.
 */
const dbInitMiddleware = async (req, res, next) => {
    try {
        // This will either start the initialization or wait for the existing one to complete
        await ensureTablesExist();
        next();
    } catch (error) {
        console.error('Failed to initialize database in middleware:', error);
        // Even if initialization fails, we might want to continue to let the route 
        // handle potential missing table errors, or we can send a 503.
        // Given the "production-safe" requirement, showing a generic error is better.
        res.status(503).json({
            message: 'Database is currently being initialized or is unavailable. Please try again in a moment.'
        });
    }
};

module.exports = dbInitMiddleware;
