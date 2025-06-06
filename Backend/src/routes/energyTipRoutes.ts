import { Router } from 'express';
import { getEnergyTips, updateEnergyTipStatus } from '../controllers/energyTipController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Routes for user-facing energy tips

// Get all personalized energy tips for the authenticated user 
// GET /api/energy-tips
router.get('/', protect, getEnergyTips);

// Update the status (isDismissed, isImplemented) of a personalized energy tip by ID
// PUT /api/energy-tips/:id/status
router.put('/:id/status', protect, updateEnergyTipStatus);

// --- Admin-only routes for GeneralEnergyTip would go in a separate file/scope ---
// Example: router.post('/general-tips', protectAdmin, addGeneralEnergyTip);

export default router;