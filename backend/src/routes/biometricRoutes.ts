import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as b from '../controllers/biometricController';

const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('settings.read'), b.summary);
router.get('/',        requirePermission('settings.read'), b.list);
router.post('/',       requirePermission('settings.update'), b.create);

export default router;