import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as cloud from '../controllers/cloudController';
const router = Router();
router.use(authenticate);
router.get('/overview', requirePermission('engineering.read'), cloud.overview);
export default router;