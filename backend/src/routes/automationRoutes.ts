import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as a from '../controllers/automationController';

const router = Router();
router.use(authenticate);
router.get('/rules',              requirePermission('settings.read'), a.rules);
router.get('/logs',               requirePermission('settings.read'), a.logs);
router.post('/rules/:id/toggle',  requirePermission('settings.update'), a.toggle);
router.post('/rules/:code/simulate', requirePermission('settings.update'), a.simulate);

export default router;