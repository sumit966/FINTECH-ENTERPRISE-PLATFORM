import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as attendance from '../controllers/attendanceController';

const router = Router();
router.use(authenticate);

// Manual attendance (self-service — any authenticated user)
router.get('/my-today',    attendance.myToday);
router.post('/check-in',   attendance.checkIn);
router.post('/check-out',  attendance.checkOut);

// Reporting (permission-gated)
router.get('/summary',        requirePermission('attendance.read'), attendance.summary);
router.get('/trend',          requirePermission('attendance.read'), attendance.trend);
router.get('/by-department',  requirePermission('attendance.read'), attendance.byDepartment);
router.get('/',               requirePermission('attendance.read'), attendance.list);

export default router;