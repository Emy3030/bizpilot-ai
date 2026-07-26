import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { currencyController } from '../controllers/currency.controller';

const router = Router();

router.use(authenticate);
router.get('/rates', currencyController.rates);

export default router;
