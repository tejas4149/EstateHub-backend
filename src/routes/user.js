import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  saveProperty,
  getSavedProperties
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/saved-properties', protect, getSavedProperties);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.post('/save-property/:propertyId', protect, saveProperty);

export default router;