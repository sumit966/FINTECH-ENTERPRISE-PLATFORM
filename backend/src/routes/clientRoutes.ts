import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as client from '../controllers/clientController';

const router = Router();

router.use(authenticate);

router.get('/summary',   requirePermission('clients.read'), client.summary);
router.get('/',          requirePermission('clients.read'), client.list);
router.get('/:code',     requirePermission('clients.read'), client.detail);

export default router;