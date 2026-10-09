import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as sec from '../controllers/securityController';
const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('security.read'), sec.summary);
router.get('/events',  requirePermission('security.read'), sec.list);
export default router;