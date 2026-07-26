import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyController } from '../controllers/verify.controller';

const router = Router();

// Public endpoint (scanned via QR code) — rate limited instead of authenticated
const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/:hash', verifyLimiter, verifyController.byHash);

export default router;
