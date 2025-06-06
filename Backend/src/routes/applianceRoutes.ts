import { Router } from "express";
import {
  addAppliance,
  getAppliances,
  getApplianceById,
  updateAppliance,
  deleteAppliance,
} from "../controllers/applianceController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();


// Add a new appliance (POST /api/appliances)
router.post("/", protect, addAppliance);

// Get all appliances for the authenticated user (GET /api/appliances)
router.get("/", protect, getAppliances);

// Get a single appliance by ID (GET /api/appliances/:id)
router.get("/:id", protect, getApplianceById);

// Update an appliance by ID (PUT /api/appliances/:id)
router.put("/:id", protect, updateAppliance);

// Delete an appliance by ID (DELETE /api/appliances/:id)
router.delete("/:id", protect, deleteAppliance);

export default router;
