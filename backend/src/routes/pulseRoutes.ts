import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as pulse from '../controllers/pulseController';

const router = Router();

router.use(authenticate);

router.get('/overview',              requirePermission('analytics.read'), pulse.overview);
router.get('/headcount-by-location', requirePermission('analytics.read'), pulse.headcountByLocation);
router.get('/headcount-by-department', requirePermission('analytics.read'), pulse.headcountByDepartment);
router.get('/projects-by-status',    requirePermission('analytics.read'), pulse.projectsByStatus);
router.get('/recent-projects',       requirePermission('analytics.read'), pulse.recentProjects);
router.get('/top-clients',           requirePermission('analytics.read'), pulse.topClients);
router.get('/recent-alerts',         requirePermission('analytics.read'), pulse.recentAlerts);
router.get('/payroll-trend',         requirePermission('analytics.read'), pulse.payrollTrend);

export default router;