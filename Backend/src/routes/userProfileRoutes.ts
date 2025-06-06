import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userProfileController';
import { protect } from '../middlewares/authMiddleware'; 

const router = Router();

// Routes for user profile management

// GET /api/profile
router.get('/', protect, getUserProfile);       

// PUT /api/profile
router.put('/', protect, updateUserProfile);    

export default router;