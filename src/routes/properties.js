import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProperties,
  uploadPropertyImages,
  getFeaturedProperties
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { propertyValidationRules, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/user/:userId', getUserProperties);
router.get('/:id', getProperty);

// Protected routes
router.post(
  '/', 
  protect, 
  authorize('user', 'seller', 'agent', 'admin'),
  propertyValidationRules.create, 
  validateRequest, 
  createProperty
);

router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/images', protect, uploadPropertyImages);

export default router;