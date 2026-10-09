import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as a from '../controllers/auditController';
const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('audit.read'), a.summary);
router.get('/',        requirePermission('audit.read'), a.list);
export default router;