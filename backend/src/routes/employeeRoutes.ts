import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as employee from '../controllers/employeeController';

const router = Router();
router.use(authenticate);

router.get('/stats',     requirePermission('employees.read'), employee.stats);
router.get('/org-tree',  requirePermission('employees.read'), employee.orgTree);
router.get('/next-code', requirePermission('employees.create'), employee.nextCode);
router.post('/',         requirePermission('employees.create'), employee.create);
router.get('/',          requirePermission('employees.read'), employee.list);
router.get('/:id',       requirePermission('employees.read'), employee.detail);

export default router;