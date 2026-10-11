import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as leave from '../controllers/leaveController';

const router = Router();
router.use(authenticate);

router.get('/summary',        requirePermission('leave.read'), leave.summary);
router.get('/by-department',  requirePermission('leave.read'), leave.byDepartment);
router.get('/',               requirePermission('leave.read'), leave.list);

router.get('/:id',          requirePermission('leave.read'),    leave.detail);
router.post('/:id/approve',   requirePermission('leave.approve'), leave.approve);
router.post('/:id/reject',    requirePermission('leave.approve'), leave.reject);

export default router;