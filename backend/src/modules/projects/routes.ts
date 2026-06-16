import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { 
  createProject, 
  listProjects, 
  getProject, 
  updateProject, 
  deleteProject 
} from './controller';

const router = Router();

// Apply auth middleware to all project endpoints
router.use(authenticateToken as any);

router.post('/', createProject as any);
router.get('/', listProjects as any);
router.get('/:id', getProject as any);
router.put('/:id', updateProject as any);
router.delete('/:id', deleteProject as any);

export default router;
