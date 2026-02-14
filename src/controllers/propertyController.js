import Property from '../models/Property.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = '-createdAt',
    type,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    city,
    status = 'available',
    featured
  } = req.query;

  // Build filter object
  const filter = { status };

  if (type) filter.type = type;
  if (propertyType) filter.propertyType = propertyType;
  if (bedrooms) filter.bedrooms = { $gte: parseInt(bedrooms) };
  if (bathrooms) filter.bathrooms = { $gte: parseInt(bathrooms) };
  if (featured === 'true') filter.featured = true;
  if (city) filter['location.city'] = new RegExp(city, 'i');

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice);
  }

  // Search by text
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await Property.countDocuments(filter);

  // Execute query
  const properties = await Property.find(filter)
    .populate('seller', 'name email phone avatar')
    .sort(sort)
    .limit(limitNum)
    .skip(skip);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: properties
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate('seller', 'name email phone avatar bio');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Increment views
  property.views += 1;
  await property.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Seller/Agent/Admin)
export const createProperty = catchAsync(async (req, res, next) => {
  // Add seller to req.body
  req.body.seller = req.user.id;

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Seller/Agent/Admin)
export const updateProperty = catchAsync(async (req, res, next) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check ownership (seller, agent, or admin)
  if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this property', 401));
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Seller/Agent/Admin)
export const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check ownership
  if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this property', 401));
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user properties
// @route   GET /api/properties/user/:userId
// @access  Public
export const getUserProperties = catchAsync(async (req, res, next) => {
  const properties = await Property.find({ 
    seller: req.params.userId,
    status: { $ne: 'deleted' }
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// @desc    Upload property images
// @route   POST /api/properties/:id/images
// @access  Private
export const uploadPropertyImages = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check ownership
  if (property.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this property', 401));
  }

  // If files were uploaded, add them to property
  if (req.files && req.files.length > 0) {
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));
    
    property.images = [...property.images, ...images];
    await property.save();
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
export const getFeaturedProperties = catchAsync(async (req, res, next) => {
  const properties = await Property.find({ featured: true, status: 'available' })
    .populate('seller', 'name')
    .limit(6)
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: properties
  });
});