import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadProductImage } from '../middleware/upload.middleware';
import { productController } from '../controllers/product.controller';
import {
  listProductsValidator,
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from '../validators/product.validator';

const router = Router();

router.use(authenticate);

router.get('/', listProductsValidator, validate, productController.list);
router.post('/', uploadProductImage, createProductValidator, validate, productController.create);
router.get('/:id', productIdValidator, validate, productController.getById);
router.put('/:id', uploadProductImage, [...productIdValidator, ...updateProductValidator], validate, productController.update);
router.delete('/:id', productIdValidator, validate, productController.remove);

export default router;
