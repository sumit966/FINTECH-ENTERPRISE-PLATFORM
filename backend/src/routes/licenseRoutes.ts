import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as license from '../controllers/licenseController';
const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('assets.read'), license.summary);
router.get('/',        requirePermission('assets.read'), license.list);
export default router;