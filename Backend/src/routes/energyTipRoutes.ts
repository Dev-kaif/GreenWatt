import { Router } from 'express';
import { generateTipsController, getTipsHistoryController } from '../controllers/energyTipController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Routes for user-facing energy tips


router.get('/', protect, generateTipsController);
router.get('/history', protect, getTipsHistoryController);

export default router;