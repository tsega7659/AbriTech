const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expecting format "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verify Error:', err.message);
      return res.status(403).json({
        message: 'Invalid or expired token',
        error: err.message,
        code: 'TOKEN_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // req.user.role should be a string (e.g. 'student'). 
    // Case-insensitive check
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const roles = allowedRoles.map(r => r.toLowerCase());

    if (!roles.includes(userRole)) {
      console.warn(`Access denied for user ${req.user.userId}. Role: ${req.user.role}, Required: ${allowedRoles}`);
      return res.status(403).json({
        message: 'Access denied: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};