import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversation
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All message routes are protected

router.post('/', sendMessage);
router.get('/', getMessages);
router.get('/conversation/:userId/:propertyId', getConversation);

export default router;