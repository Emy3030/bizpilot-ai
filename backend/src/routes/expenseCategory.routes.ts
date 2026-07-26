import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { expenseCategoryController } from '../controllers/expenseCategory.controller';
import { expenseCategoryNameValidator, expenseCategoryIdValidator } from '../validators/expenseCategory.validator';

const router = Router();

router.use(authenticate);

router.get('/', expenseCategoryController.list);
router.post('/', expenseCategoryNameValidator, validate, expenseCategoryController.create);
router.put(
  '/:id',
  [...expenseCategoryIdValidator, ...expenseCategoryNameValidator],
  validate,
  expenseCategoryController.update
);
router.delete('/:id', expenseCategoryIdValidator, validate, expenseCategoryController.remove);

export default router;
