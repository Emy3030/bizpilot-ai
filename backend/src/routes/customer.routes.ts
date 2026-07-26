import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { customerController } from '../controllers/customer.controller';
import {
  listCustomersValidator,
  createCustomerValidator,
  updateCustomerValidator,
  customerIdValidator,
} from '../validators/customer.validator';

const router = Router();

router.use(authenticate);

router.get('/', listCustomersValidator, validate, customerController.list);
router.post('/', createCustomerValidator, validate, customerController.create);
router.get('/:id', customerIdValidator, validate, customerController.getById);
router.put('/:id', updateCustomerValidator, validate, customerController.update);
router.delete('/:id', customerIdValidator, validate, customerController.remove);

export default router;
