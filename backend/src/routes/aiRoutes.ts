import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as ai from '../controllers/aiController';
const router = Router();
router.use(authenticate);
router.post('/ask', (req, res, next) => ai.ask(req, res, next));
router.get('/provider', (req, res, next) => ai.provider(req, res, next));
export default router;