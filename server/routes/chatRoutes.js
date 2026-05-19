import { Router } from 'express';
import { sendChatMessage, generateChatTitle } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/send', protect, sendChatMessage);
router.post('/title', protect, generateChatTitle);

export default router;
