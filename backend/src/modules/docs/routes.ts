import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
  generateDocument,
  exportDocument,
  getProjectDocuments
} from './controller';

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken as any);

router.post('/:document_type', generateDocument as any);
router.get('/:document_id/export', exportDocument as any);
router.get('/project/:project_id', getProjectDocuments as any);

export default router;
