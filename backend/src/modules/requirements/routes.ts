import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
  analyzeRequirements,
  generateNextQuestion,
  saveRequirementAnswer,
  validateRequirements,
  getRequirements
} from './controller';

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken as any);

router.get('/:project_id', getRequirements as any);
router.post('/analyze', analyzeRequirements as any);
router.post('/question', generateNextQuestion as any);
router.post('/answer', saveRequirementAnswer as any);
router.post('/validate', validateRequirements as any);


export default router;
