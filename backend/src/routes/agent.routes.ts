import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { agentController } from '../controllers/agent.controller';

const router = Router();

router.use(authenticate);
router.get('/', agentController.list);

export default router;
