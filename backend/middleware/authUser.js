import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authUser = async (req, res, next) => {
  try {
    const tokenFromCookie = req?.cookies?.token;
    const authHeader = req?.headers?.authorization;
    const tokenFromHeader =
      authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized - token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Not Authorized - invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

  req.user = user; 
  next();
  } catch (error) {
    console.error('authUser error:', error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
