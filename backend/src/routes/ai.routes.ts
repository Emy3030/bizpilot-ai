import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiController } from '../controllers/ai.controller';
import { chatMessageValidator, historyQueryValidator } from '../validators/ai.validator';

const router = Router();

router.use(authenticate);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages — please slow down a little.' },
});

router.get('/history', historyQueryValidator, validate, aiController.history);
router.delete('/history', aiController.clearHistory);
router.post('/chat', chatLimiter, chatMessageValidator, validate, aiController.chat);

export default router;
