import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  new ApiResponse(200, users, 'Users retrieved successfully').send(res);
});

export { getAllUsers };