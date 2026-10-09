import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as recruitment from '../controllers/recruitmentController';

const router = Router();
router.use(authenticate);

router.get('/summary',              requirePermission('recruitment.read'), recruitment.summary);
router.get('/jobs',                 requirePermission('recruitment.read'), recruitment.jobs);
router.get('/candidates',           requirePermission('recruitment.read'), recruitment.candidates);
router.get('/candidates/:code',     requirePermission('recruitment.read'), recruitment.candidateDetail);
router.get('/pipeline',             requirePermission('recruitment.read'), recruitment.pipeline);
router.get('/interviews',           requirePermission('recruitment.read'), recruitment.interviews);

export default router;