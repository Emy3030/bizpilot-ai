import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { newsController } from '../controllers/news.controller';

const router = Router();

router.use(authenticate);
router.get('/business', newsController.businessHeadlines);

export default router;
