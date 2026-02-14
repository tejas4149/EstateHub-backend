import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout, 
  updatePassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { userValidationRules, validateRequest } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', userValidationRules.register, validateRequest, register);
router.post('/login', userValidationRules.login, validateRequest, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);

export default router;