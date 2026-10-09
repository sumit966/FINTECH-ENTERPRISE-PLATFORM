import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as project from '../controllers/projectController';

const router = Router();

router.use(authenticate);

router.get('/summary',   requirePermission('projects.read'), project.summary);
router.get('/',          requirePermission('projects.read'), project.list);
router.get('/:code',     requirePermission('projects.read'), project.detail);

export default router;