import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { sendMessage, getChatHistory, clearChatHistory } from './controller';

const router = Router();

// Apply auth middleware to all chat endpoints
router.use(authenticateToken as any);

router.post('/message', sendMessage as any);
router.get('/history/:project_id', getChatHistory as any);
router.delete('/history/:project_id', clearChatHistory as any);

export default router;
