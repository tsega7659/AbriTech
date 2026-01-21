const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'your_super_secret_key';
console.log('Using secret:', secret);

const payload = { userId: 1, role: 'admin', username: 'testadmin' };
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Generated Token:', token);

jwt.verify(token, secret, (err, decoded) => {
    if (err) {
        console.error('Verification Failed:', err.message);
    } else {
        console.log('Verification Successful!');
        console.log('Decoded:', decoded);
    }
});
