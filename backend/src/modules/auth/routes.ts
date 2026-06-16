import { Router } from 'express';
import { register, login, refresh, logout, getProfile, updateProfile, updatePassword, forgotPassword, resetPassword } from './controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile Management (Authenticated)
router.get('/profile', authenticateToken as any, getProfile as any);
router.put('/profile', authenticateToken as any, updateProfile as any);
router.put('/profile/password', authenticateToken as any, updatePassword as any);

export default router;
