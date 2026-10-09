import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import * as finance from '../controllers/financeController';

const router = Router();

router.use(authenticate);

router.get('/summary',              requirePermission('finance.read'), finance.summary);
router.get('/revenue-vs-expenses',  requirePermission('finance.read'), finance.revenueVsExpenses);
router.get('/expense-breakdown',    requirePermission('finance.read'), finance.expenseBreakdown);
router.get('/top-clients',          requirePermission('finance.read'), finance.topClients);
router.get('/invoices',             requirePermission('invoices.read'), finance.invoices);
router.get('/expenses',             requirePermission('expenses.read'), finance.expenses);

export default router;