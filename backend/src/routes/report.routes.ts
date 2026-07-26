import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { reportController } from '../controllers/report.controller';
import { reportSummaryValidator } from '../validators/report.validator';

const router = Router();

router.use(authenticate);

router.get('/summary', reportSummaryValidator, validate, reportController.summary);

export default router;
