import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as n from '../controllers/notificationController';
const router = Router();
router.use(authenticate);
router.post('/read-all',      (req, res, next) => n.markAllRead(req, res, next));
router.post('/:id/read',      (req, res, next) => n.markRead(req, res, next));
router.get('/',               (req, res, next) => n.list(req, res, next));
export default router;