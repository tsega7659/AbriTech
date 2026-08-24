const rateLimit = require('express-rate-limit');


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per 15 minutes
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});


const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many accounts created from this IP. Please try again after an hour.'
    }
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many requests. Please slow down and try again later.'
    }
});


const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many payment requests initiated. Please wait a few minutes before trying again.'
    }
});

module.exports = {
    authLimiter,
    registerLimiter,
    generalLimiter,
    paymentLimiter
};
