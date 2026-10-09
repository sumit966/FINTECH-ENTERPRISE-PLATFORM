import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as doc from '../controllers/documentController';
const router = Router();
router.use(authenticate);
router.get('/summary', requirePermission('documents.read'), doc.summary);
router.get('/',        requirePermission('documents.read'), doc.list);
export default router;