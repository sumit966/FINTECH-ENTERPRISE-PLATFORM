import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as s from '../controllers/searchController';
const router = Router();
router.use(authenticate);
router.get('/', (req, res, next) => s.search(req, res, next));
export default router;