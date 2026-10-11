import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as f from '../controllers/fundingController';

const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('finance.read'), f.summary);
router.get('/',        requirePermission('finance.read'), f.list);
router.get('/:code',   requirePermission('finance.read'), f.detail);

export default router;