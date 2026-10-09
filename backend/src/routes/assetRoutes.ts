import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as asset from '../controllers/assetController';
const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('assets.read'), asset.summary);
router.get('/',        requirePermission('assets.read'), asset.list);
export default router;