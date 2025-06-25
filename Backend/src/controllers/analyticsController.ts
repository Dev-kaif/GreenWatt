import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to group meter readings by month and calculate totals
const getMonthlySummary = (readings: any[]) => {
  const monthlyData: {
    [key: string]: {
      totalConsumptionKWH: number;
      totalEmissionCO2kg: number;
      monthStart: Date; // To keep track of the month's exact start for sorting
    };
  } = {};

  readings.forEach((reading) => {
    const date = new Date(reading.readingDate);
    // Get month and year for grouping (e.g., "2023-01")
    const monthKey = date.toISOString().substring(0, 7);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        totalConsumptionKWH: 0,
        totalEmissionCO2kg: 0,
        monthStart: new Date(date.getFullYear(), date.getMonth(), 1),
      };
    }
    monthlyData[monthKey].totalConsumptionKWH += reading.consumptionKWH;
    // Ensure emissionCO2kg is a number before adding, default to 0 if null/undefined
    monthlyData[monthKey].totalEmissionCO2kg += reading.emissionCO2kg || 0;
  });

  // Convert to an array and sort by month
  return Object.values(monthlyData).sort(
    (a, b) => a.monthStart.getTime() - b.monthStart.getTime()
  );
};

// Calculate Total Monetary Savings
export const getTotalSavings = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user ID

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        readings: {
          orderBy: {
            readingDate: "asc", // Ensure readings are sorted for baseline calculation
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const electricityRatePerKWh = user.userProfile?.electricityRatePerKWh;

    if (!electricityRatePerKWh || electricityRatePerKWh <= 0) {
      res.status(200).json({
        totalSavings: 0, // Or 'N/A' to indicate rate is missing
        message: "Electricity rate not set in profile, cannot calculate savings.",
      });
      return;
    }

    const allReadings = user.readings;

    if (allReadings.length < 1) { // Need at least one reading to consider any data
      res.status(200).json({
        totalSavings: 0,
        message: "No meter readings available to calculate savings.",
      });
      return;
    }

    const monthlySummary = getMonthlySummary(allReadings);

    // Define baseline period (e.g., first 3 months with data)
    const BASELINE_MONTHS = 3;
    if (monthlySummary.length < BASELINE_MONTHS) {
      res.status(200).json({
        totalSavings: 0,
        message: `Not enough historical data (need at least ${BASELINE_MONTHS} months) to establish a baseline for savings.`,
      });
      return;
    }

    // Calculate baseline average consumption
    const baselinePeriod = monthlySummary.slice(0, BASELINE_MONTHS);
    const totalBaselineConsumption = baselinePeriod.reduce(
      (sum, month) => sum + month.totalConsumptionKWH,
      0
    );
    const averageBaselineConsumption = totalBaselineConsumption / BASELINE_MONTHS;

    let cumulativeSavingsKWH = 0;
    // Calculate savings for months *after* the baseline period
    for (let i = BASELINE_MONTHS; i < monthlySummary.length; i++) {
      const currentMonthConsumption = monthlySummary[i].totalConsumptionKWH;
      const difference = averageBaselineConsumption - currentMonthConsumption; // Positive if current < baseline
      cumulativeSavingsKWH += difference;
    }

    const totalMonetarySavings = cumulativeSavingsKWH * electricityRatePerKWh;

    res.status(200).json({
      totalSavings: parseFloat(totalMonetarySavings.toFixed(2)),
      message: "Total monetary savings calculated successfully.",
    });
    return;
  } catch (error: any) {
    console.error("Error calculating total savings:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

// Calculate Total CO2 Reduction
export const getTotalCo2Reduction = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user ID

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        readings: {
          orderBy: {
            readingDate: "asc", // Ensure readings are sorted for baseline calculation
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const allReadings = user.readings;

    if (allReadings.length < 1) { // Need at least one reading
      res.status(200).json({
        totalCo2Reduction: 0,
        message: "No meter readings available to calculate CO2 reduction.",
      });
      return;
    }

    const monthlySummary = getMonthlySummary(allReadings);

    // Define baseline period (e.g., first 3 months with data)
    const BASELINE_MONTHS = 3;
    if (monthlySummary.length < BASELINE_MONTHS) {
      res.status(200).json({
        totalCo2Reduction: 0,
        message: `Not enough historical data (need at least ${BASELINE_MONTHS} months) to establish a baseline for CO2 reduction.`,
      });
      return;
    }

    // Calculate baseline average CO2 emissions
    const baselinePeriod = monthlySummary.slice(0, BASELINE_MONTHS);
    const totalBaselineEmissions = baselinePeriod.reduce(
      (sum, month) => sum + month.totalEmissionCO2kg,
      0
    );
    const averageBaselineEmissions = totalBaselineEmissions / BASELINE_MONTHS;

    let cumulativeCo2ReductionKg = 0;
    // Calculate reduction for months *after* the baseline period
    for (let i = BASELINE_MONTHS; i < monthlySummary.length; i++) {
      const currentMonthEmissions = monthlySummary[i].totalEmissionCO2kg;
      const difference = averageBaselineEmissions - currentMonthEmissions; // Positive if current < baseline
      cumulativeCo2ReductionKg += difference;
    }

    res.status(200).json({
      totalCo2Reduction: parseFloat(cumulativeCo2ReductionKg.toFixed(2)),
      message: "Total CO2 reduction calculated successfully.",
    });
    return;
  } catch (error: any) {
    console.error("Error calculating total CO2 reduction:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};