import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as e from '../controllers/engineeringController';
const router = Router();
router.use(authenticate);

router.get('/summary',            requirePermission('engineering.read'), e.summary);
router.get('/repos',              requirePermission('engineering.read'), e.repos);
router.get('/repos/:code',        requirePermission('engineering.read'), e.repoDetail);
router.get('/pull-requests',      requirePermission('engineering.read'), e.pullRequests);
router.get('/builds',             requirePermission('engineering.read'), e.builds);
router.get('/deployments',        requirePermission('engineering.read'), e.deployments);

export default router;