import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { categoryController } from '../controllers/category.controller';
import { categoryNameValidator, categoryIdValidator } from '../validators/category.validator';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', categoryNameValidator, validate, categoryController.create);
router.put('/:id', [...categoryIdValidator, ...categoryNameValidator], validate, categoryController.update);
router.delete('/:id', categoryIdValidator, validate, categoryController.remove);

export default router;
