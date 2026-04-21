const jwt = require('jsonwebtoken');
require('dotenv').config();

const normalizeRole = (role) => {
  const map = { organiser: 'Organiser', hod: 'HOD' };
  return map[String(role || '').toLowerCase()] || role;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...decoded, role: normalizeRole(decoded.role) };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!allowedRoles.includes(normalizeRole(req.user.role))) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
    });
  }
  next();
};

module.exports = { verifyToken, checkRole };
