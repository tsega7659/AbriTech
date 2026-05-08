const pool = require('../config/db');

/**
 * Course Service
 * Handles business logic for course pricing and data retrieval
 */
const courseService = {
    /**
     * Calculates the final price of a course based on its discount status
     * @param {Object} course - The course object from DB
     * @returns {number} - The final price to charge
     */
    calculateFinalPrice: (course) => {
        if (course.isFree) return 0;
        
        const price = parseFloat(course.price || 0);
        const discountPrice = parseFloat(course.discountPrice || 0);
        
        if (course.hasDiscount && discountPrice > 0) {
            return discountPrice;
        }
        
        return price;
    },

    /**
     * Gets course details with consistent formatting
     * @param {number|string} courseId 
     * @returns {Promise<Object|null>}
     */
    getCourseById: async (courseId) => {
        const [courses] = await pool.execute(
            'SELECT id, name, price, "isFree", "hasDiscount", "discountPrice", "youtubeLink", image FROM course WHERE id = ?',
            [courseId]
        );
        return courses[0] || null;
    }
};

module.exports = courseService;
