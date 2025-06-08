import { verifyToken } from '../config/jwt.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.signedCookies?.token) {
    token = req.signedCookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token failed');
  }
});

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    throw new ApiError(403, 'Not authorized as admin');
  }
};

export { protect, admin };
