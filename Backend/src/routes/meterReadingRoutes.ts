import { Router } from "express";
import {
  addMeterReading,
  deleteMeterReading,
  getMeterReadingById,
  getMeterReadings,
  getMonthlyConsumptionSummary,
  updateMeterReading,
  uploadMeterReadingsCsv,
} from "../controllers/meterReadingController";
import { protect } from "../middlewares/authMiddleware";
import { uploadCsv } from "../middlewares/uploadMiddleware";

const router = Router();

// This route requires authentication
router.post("/", protect, addMeterReading);

router.get("/", protect, getMeterReadings);

// Get a single meter reading by ID (GET /api/meter-readings/:id)
router.get("/:id", protect, getMeterReadingById);

// Update a meter reading by ID (PUT /api/meter-readings/:id)
router.put("/:id", protect, updateMeterReading);

// Delete a meter reading by ID (DELETE /api/meter-readings/:id)
router.delete("/:id", protect, deleteMeterReading);

router.post('/upload-csv', protect, uploadCsv, uploadMeterReadingsCsv);

// get summary of monthly cunsumption for data visualaization
router.get('/summary', protect, getMonthlyConsumptionSummary);


export default router;
