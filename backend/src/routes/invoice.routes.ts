import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { invoiceController } from '../controllers/invoice.controller';

const router = Router();

router.use(authenticate);

router.get('/', invoiceController.list);

export default router;
