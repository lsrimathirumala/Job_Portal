const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    
    // Add payload validation and normalization
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Token payload malformed - missing userId' });
    }

    // Normalize the userId in case it's wrapped in an object
    if (typeof decoded.userId === 'object' && decoded.userId.User) {
      decoded.userId = decoded.userId.User;
    }

    // Ensure userId is a string
    if (typeof decoded.userId !== 'string') {
      return res.status(401).json({ error: 'Token payload malformed - userId must be a string' });
    }

    console.log('Normalized JWT payload:', decoded);
    req.user = decoded;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles,
};