const crypto = require('crypto');

const generateReferralCode = (length = 8) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, length) // return required number of characters
        .toUpperCase(); // return in uppercase
};

module.exports = { generateReferralCode };
