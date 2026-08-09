import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { agentActionController } from '../controllers/agentAction.controller';

const router = Router();

router.use(authenticate);

router.get('/', agentActionController.list);
router.post('/:id/approve', agentActionController.approve);
router.post('/:id/reject', agentActionController.reject);

export default router;
