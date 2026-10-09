import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as c from '../controllers/calendarController';
const router = Router();
router.use(authenticate);
router.get('/summary', (req, res, next) => c.summary(req, res, next));
router.get('/',        (req, res, next) => c.list(req, res, next));
export default router;