/**
 * Middleware to check if user is on first login
 * Redirects to credential update page if firstLogin flag is true
 */
const checkFirstLogin = async (req, res, next) => {
    try {
        const { userId } = req.user; // From authenticateToken middleware

        const pool = require('../config/db');
        const [users] = await pool.execute(
            'SELECT firstLogin FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // If firstLogin is true, require credential update
        if (user.firstLogin === 1) {
            return res.status(403).json({
                message: 'Please update your credentials before proceeding',
                requiresCredentialUpdate: true
            });
        }

        next();
    } catch (error) {
        console.error('First Login Check Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkFirstLogin };
