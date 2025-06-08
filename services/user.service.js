import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

const getUserProfile = async (userId) => {
  return await User.findById(userId).select('-password');
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateUserAddress = async (userId, addressData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { address: addressData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export { getUserProfile, updateUserProfile, updateUserAddress };