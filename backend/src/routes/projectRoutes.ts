import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as project from '../controllers/projectController';
import * as financial from '../controllers/financialController';

const router = Router();
router.use(authenticate);

router.get('/summary',              requirePermission('projects.read'), project.summary);
router.get('/',                     requirePermission('projects.read'), project.list);
router.get('/:code',                requirePermission('projects.read'), project.detail);
router.get('/:code/financials',     requirePermission('finance.read'),  financial.getFinancials);

export default router;