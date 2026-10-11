import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as e from '../controllers/examBuilderController';

const router = Router();
router.use(authenticate);

router.get('/questions',           requirePermission('exams.read'), e.questions);
router.get('/list',                requirePermission('exams.read'), e.list);
router.get('/:id',                 requirePermission('exams.read'), e.detail);
router.post('/',                   requirePermission('exams.create'), e.create);
router.post('/:id/publish',        requirePermission('exams.approve'), e.publish);
router.post('/:id/unpublish',      requirePermission('exams.approve'), e.unpublish);

export default router;