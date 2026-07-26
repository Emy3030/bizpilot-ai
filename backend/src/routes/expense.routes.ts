import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { expenseController } from '../controllers/expense.controller';
import {
  listExpensesValidator,
  createExpenseValidator,
  updateExpenseValidator,
  expenseIdValidator,
} from '../validators/expense.validator';

const router = Router();

router.use(authenticate);

router.get('/summary', expenseController.summary);
router.get('/', listExpensesValidator, validate, expenseController.list);
router.post('/', createExpenseValidator, validate, expenseController.create);
router.put('/:id', [...expenseIdValidator, ...updateExpenseValidator], validate, expenseController.update);
router.delete('/:id', expenseIdValidator, validate, expenseController.remove);

export default router;
