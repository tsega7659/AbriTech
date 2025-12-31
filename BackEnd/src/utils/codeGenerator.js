const crypto = require('crypto');

/**
 * Generate a random referral code
 * @param {number} length - Length of the code (default: 8)
 * @returns {string} - Random alphanumeric code
 */
const generateReferralCode = (length = 8) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};

/**
 * Generate username from full name
 * @param {string} fullName - User's full name
 * @returns {string} - Username in lowercase without spaces
 */
const generateUsername = (fullName) => {
    // Convert to lowercase and replace spaces with dots
    const username = fullName.toLowerCase()
        .replace(/\s+/g, '.') // Replace spaces with dots
        .replace(/[^a-z0-9._-]/g, ''); // Remove special characters
    return username;
};

/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Random password with mixed characters
 */
const generateSecurePassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each type
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
    generateReferralCode,
    generateUsername,
    generateSecurePassword
};
