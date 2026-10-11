import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as ob from '../controllers/onboardingController';

const router = Router();
router.use(authenticate);

router.get('/',                  requirePermission('employees.read'), ob.list);
router.get('/:id',               requirePermission('employees.read'), ob.detail);
router.post('/start',            requirePermission('employees.create'), ob.start);
router.post('/tasks/:taskId/complete', requirePermission('employees.update'), ob.completeTask);

export default router;