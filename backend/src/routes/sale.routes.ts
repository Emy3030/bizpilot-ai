import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { saleController } from '../controllers/sale.controller';
import {
  createSaleValidator,
  listSalesValidator,
  saleIdValidator,
  recordPaymentValidator,
} from '../validators/sale.validator';

const router = Router();

router.use(authenticate);

router.get('/', listSalesValidator, validate, saleController.list);
router.post('/', createSaleValidator, validate, saleController.create);
router.get('/:id', saleIdValidator, validate, saleController.getById);
router.post('/:id/payments', recordPaymentValidator, validate, saleController.recordPayment);
router.post('/:id/invoice', saleIdValidator, validate, saleController.generateInvoice);
router.post('/:id/receipt', saleIdValidator, validate, saleController.generateReceipt);

export default router;
