import { getTotalCo2Reduction, getTotalSavings } from "../controllers/analyticsController";
import { protect } from "../middlewares/authMiddleware";
import router from "./authRoutes";

router.get("/total-savings", protect, getTotalSavings);
router.get("/total-co2-reduction", protect, getTotalCo2Reduction);

export default router;

