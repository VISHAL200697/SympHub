import jwt from 'jsonwebtoken';
import User from './models/User.js';

export const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'symposium_super_secret_jwt_key_2026_mern_version'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ detail: 'User account not found.' });
      }

      if (!user.is_active) {
        return res.status(403).json({ detail: 'User account is deactivated.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT auth error:', error.message);
      return res.status(401).json({ detail: 'Could not validate credentials / Token expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Not authorized, no token provided.' });
  }
};

// Protect alias for compatibility
export const protect = verifyToken;

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        detail: `Access denied: User role '${req.user?.role}' lacks required permissions.`,
      });
    }
    next();
  };
};

export default { verifyToken, protect, requireRole };
