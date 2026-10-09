import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as exam from '../controllers/examController';

const router = Router();
router.use(authenticate);

router.get('/summary',                  requirePermission('exams.read'), exam.summary);
router.get('/questions',                requirePermission('exams.read'), exam.questions);
router.get('/assessments',              requirePermission('exams.read'), exam.assessments);
router.get('/assessments/:code',        requirePermission('exams.read'), exam.assessmentDetail);
router.get('/attempts',                 requirePermission('exams.read'), exam.attempts);

export default router;