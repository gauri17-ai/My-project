import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  getUsers,
  suspendUser,
  activateUser,
  changeUserRole,
  getAnalytics,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle
} from './controller';

const router = Router();

// Require authenticated token
router.use(authenticateToken as any);

// Middleware to restrict access to Admins only
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Administrator privileges are required.'
      }
    });
  }
  next();
};

router.use(requireAdmin as any);

// User Management
router.get('/users', getUsers as any);
router.post('/users/:id/suspend', suspendUser as any);
router.post('/users/:id/activate', activateUser as any);
router.post('/users/:id/role', changeUserRole as any);

// Analytics
router.get('/analytics', getAnalytics as any);

// Knowledge Base CRUD
router.get('/kb', getArticles as any);
router.post('/kb', createArticle as any);
router.put('/kb/:id', updateArticle as any);
router.delete('/kb/:id', deleteArticle as any);

export default router;
