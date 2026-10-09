import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as payroll from '../controllers/payrollController';

const router = Router();

router.use(authenticate);

router.get('/summary',                requirePermission('payroll.read'), payroll.summary);
router.get('/trend',                  requirePermission('payroll.read'), payroll.trend);
router.get('/by-department',          requirePermission('payroll.read'), payroll.byDepartment);
router.get('/employee/:employeeCode', requirePermission('payroll.read'), payroll.employeeHistory);
router.get('/',                       requirePermission('payroll.read'), payroll.list);

export default router;