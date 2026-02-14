import Message from '../models/Message.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Send message to seller
// @route   POST /api/messages
// @access  Private
export const sendMessage = catchAsync(async (req, res, next) => {
  const { propertyId, content } = req.body;

  // Get property to find seller
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Don't allow users to message themselves
  if (property.seller.toString() === req.user.id) {
    return next(new AppError('You cannot message yourself', 400));
  }

  const message = await Message.create({
    property: propertyId,
    sender: req.user.id,
    receiver: property.seller,
    content
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get user's messages
// @route   GET /api/messages
// @access  Private
export const getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id },
      { receiver: req.user.id }
    ]
  })
  .populate('sender', 'name email avatar')
  .populate('receiver', 'name email avatar')
  .populate('property', 'title images price')
  .sort('-createdAt');

  // Mark messages as read
  await Message.updateMany(
    { receiver: req.user.id, read: false },
    { read: true }
  );

  // Separate sent and received messages
  const sentMessages = messages.filter(msg => 
    msg.sender._id.toString() === req.user.id
  );
  const receivedMessages = messages.filter(msg => 
    msg.receiver._id.toString() === req.user.id
  );

  res.status(200).json({
    success: true,
    data: {
      sent: sentMessages,
      received: receivedMessages,
      unreadCount: receivedMessages.filter(msg => !msg.read).length
    }
  });
});

// @desc    Get conversation with specific user/property
// @route   GET /api/messages/conversation/:userId/:propertyId
// @access  Private
export const getConversation = catchAsync(async (req, res, next) => {
  const { userId, propertyId } = req.params;

  const messages = await Message.find({
    property: propertyId,
    $or: [
      { sender: req.user.id, receiver: userId },
      { sender: userId, receiver: req.user.id }
    ]
  })
  .populate('sender', 'name email avatar')
  .populate('receiver', 'name email avatar')
  .populate('property', 'title images')
  .sort('createdAt');

  // Mark messages as read
  await Message.updateMany(
    { 
      receiver: req.user.id, 
      sender: userId,
      property: propertyId,
      read: false 
    },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: messages
  });
});