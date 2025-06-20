import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import meterReadingRoutes from "./routes/meterReadingRoutes";
import userProfileRoutes from "./routes/userProfileRoutes";
import applianceRoutes from "./routes/applianceRoutes";
import energyTipRoutes from "./routes/energyTipRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import cors from "cors";
import { FRONTEND_URL } from "./config/config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/meter-readings", meterReadingRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/appliances", applianceRoutes);
app.use("/api/energy-tips", energyTipRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT);
