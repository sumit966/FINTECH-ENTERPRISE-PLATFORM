import { Router } from 'express';
import authRoutes from './authRoutes';
import pulseRoutes from './pulseRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pulse', pulseRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nexus-backend', ts: new Date().toISOString() });
});

export default router;