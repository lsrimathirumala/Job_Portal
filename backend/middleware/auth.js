const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

// Middleware to authenticate JWT token
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Normalize and validate userId
    let userId = decoded.userId;

    // Handle case: userId is an object like { User: 'abc123' }
    if (typeof userId === 'object' && userId !== null && userId.User) {
      userId = userId.User;
    }

    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Token payload malformed - userId must be a string' });
    }

    decoded.userId = userId; // Store normalized value back
    req.user = decoded;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Authenticated user:', decoded);
    }

    next();
  });
}

// Middleware to authorize specific roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
