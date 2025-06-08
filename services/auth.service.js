import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { generateToken } from '../config/jwt.js';

const registerUser = async (userData) => {
  // Check if email already exists
  if (await User.findOne({ email: userData.email })) {
    throw new ApiError(400, 'Email already in use');
  }

  // Create user
  const user = await User.create(userData);
  
  // Generate JWT token
  const token = generateToken(user._id);

  // Remove password from return data
  user.password = undefined;

  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user._id);
  user.password = undefined;

  return { user, token };
};

const getCurrentUser = async (userId) => {
  return await User.findById(userId);
};

export { registerUser, loginUser, getCurrentUser };