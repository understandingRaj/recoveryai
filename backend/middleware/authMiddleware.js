import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recoverai_super_secure_jwt_token_secret_key_2026');

      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) {
        req.businessId = req.user.businessId;
        return next();
      }
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  // Fallback for development/demo testing when header not passed
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const demoUser = await User.findOne();
    if (demoUser) {
      req.user = demoUser;
      req.businessId = demoUser.businessId;
      return next();
    }
  }

  return res.status(401).json({ message: 'Not authorized, no Bearer token provided' });
};
