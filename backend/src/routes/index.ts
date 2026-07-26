import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import customerRoutes from './customer.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import saleRoutes from './sale.routes';
import expenseCategoryRoutes from './expenseCategory.routes';
import expenseRoutes from './expense.routes';
import reportRoutes from './report.routes';
import aiRoutes from './ai.routes';
import verifyRoutes from './verify.routes';
import newsRoutes from './news.routes';
import currencyRoutes from './currency.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'BizPilot AI API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/expense-categories', expenseCategoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/verify', verifyRoutes); // public — no auth middleware inside
router.use('/news', newsRoutes);
router.use('/currency', currencyRoutes);

export default router;
