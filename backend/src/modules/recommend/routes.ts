import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
  generateTechRecommendation,
  generateFeatureRecommendation,
  getRecommendations
} from './controller';

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken as any);

router.get('/:project_id', getRecommendations as any);
router.post('/technology', generateTechRecommendation as any);
router.post('/features', generateFeatureRecommendation as any);

export default router;
