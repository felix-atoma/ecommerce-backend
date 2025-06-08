import User from '../models/User.js';
import { generateToken, attachCookies } from '../config/jwt.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new ApiError(400, 'Email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);
  attachCookies(res, token);

  user.password = undefined;
  new ApiResponse(201, { user, token }, 'Registration successful').send(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user._id);
  attachCookies(res, token);

  user.password = undefined;
  new ApiResponse(200, { user, token }, 'Login successful').send(res);
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  new ApiResponse(200, null, 'User logged out').send(res);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  new ApiResponse(200, user, 'Current user data').send(res);
});

export { register, login, logout, getCurrentUser };