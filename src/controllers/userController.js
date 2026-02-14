import User from '../models/User.js';
import Property from '../models/Property.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get user's listings
  const listings = await Property.find({ seller: user._id, status: 'available' });

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      listingsCount: listings.length,
      listings
    }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, bio, avatar } = req.body;

  // Check if user is updating their own profile or is admin
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this user', 401));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, bio, avatar },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Delete user's properties
  await Property.deleteMany({ seller: user._id });

  // Delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Save property to user's favorites
// @route   POST /api/users/save-property/:propertyId
// @access  Private
export const saveProperty = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const propertyId = req.params.propertyId;

  // Check if property is already saved
  if (user.savedProperties.includes(propertyId)) {
    // Remove from saved
    user.savedProperties = user.savedProperties.filter(
      id => id.toString() !== propertyId
    );
  } else {
    // Add to saved
    user.savedProperties.push(propertyId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    savedProperties: user.savedProperties
  });
});

// @desc    Get user's saved properties
// @route   GET /api/users/saved-properties
// @access  Private
export const getSavedProperties = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedProperties',
    match: { status: 'available' }
  });

  res.status(200).json({
    success: true,
    data: user.savedProperties
  });
});