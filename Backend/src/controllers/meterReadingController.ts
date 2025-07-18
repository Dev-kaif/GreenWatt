import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import { updateUserEmbedding } from "../services/updateUserEmbedding";

const prisma = new PrismaClient();

// Add Meter Reading (already provided in previous turn)
export const addMeterReading = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { readingDate, consumptionKWH, emissionCO2kg, source } = req.body;

  if (
    !userId ||
    !readingDate ||
    consumptionKWH === undefined ||
    consumptionKWH === null
  ) {
    res.status(400).json({
      message: "Missing required fields: userId, readingDate, consumptionKWH.",
    });
    return;
  }

  const parsedDate = new Date(readingDate);
  if (isNaN(parsedDate.getTime())) {
    res
      .status(400)
      .json({ message: "Invalid readingDate format. Please use YYYY-MM-DD." });
    return;
  }
  const firstDayOfMonth = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    1
  );

  try {
    const existingReading = await prisma.meterReading.findUnique({
      where: {
        userId_readingDate: {
          userId: userId,
          readingDate: firstDayOfMonth,
        },
      },
    });

    if (existingReading) {
      res.status(409).json({
        message:
          "A meter reading for this user and month already exists. Consider updating it instead.",
      });
      return;
    }

    const newReading = await prisma.meterReading.create({
      data: {
        userId: userId,
        readingDate: firstDayOfMonth,
        consumptionKWH: parseFloat(consumptionKWH),
        emissionCO2kg: emissionCO2kg ? parseFloat(emissionCO2kg) : undefined,
        source: source || "manual",
      },
    });

    await updateUserEmbedding(userId);

    res.status(201).json({
      message: "Meter reading added successfully.",
      reading: newReading,
    });
    return;
  } catch (error: any) {
    console.error("Error adding meter reading:", error);
    if (error.code === "P2003") {
      res
        .status(400)
        .json({ message: "User not found.", error: error.message });
      return;
    }
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

// Get All Meter Readings for the authenticated user
export const getMeterReadings = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return 
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const sort = req.query.sort as string || 'readingDate';
  const order = req.query.order as 'asc' | 'desc' || 'desc';

  const startDateParam = req.query.startDate as string;
  const endDateParam = req.query.endDate as string;
  const sourceParam = req.query.source as string;

  try {
    const where: any = {
      userId: userId,
    };

    if (startDateParam || endDateParam) {
      where.readingDate = {};
      if (startDateParam) {
        where.readingDate.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setDate(end.getDate() + 1);
        where.readingDate.lt = end;
      }
    }

    if (sourceParam && (sourceParam === 'manual' || sourceParam === 'csv_upload')) { 
      where.source = sourceParam;
    }

    const readings = await prisma.meterReading.findMany({
      where: where,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    });

    const totalCount = await prisma.meterReading.count({
      where: where,
    });

    res.status(200).json({
      message: "Meter readings retrieved successfully.",
      readings: readings,
      totalCount: totalCount,
    });

  } catch (error: any) {
    console.error("Error retrieving meter readings:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// Get Single Meter Reading by ID for the authenticated user
export const getMeterReadingById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Reading ID from URL parameter

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const reading = await prisma.meterReading.findUnique({
      where: {
        id: id,
        userId: userId, // Ensure the reading belongs to the authenticated user
      },
    });

    if (!reading) {
      res.status(404).json({
        message: "Meter reading not found or does not belong to user.",
      });
      return;
    }

    res.status(200).json({
      message: "Meter reading retrieved successfully.",
      reading: reading,
    });
    return;
  } catch (error: any) {
    console.error("Error retrieving single meter reading:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

// Update Meter Reading for the authenticated user
export const updateMeterReading = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Reading ID from URL parameter
  const { consumptionKWH, emissionCO2kg, source } = req.body;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  // At least one field to update must be provided
  if (
    consumptionKWH === undefined &&
    emissionCO2kg === undefined &&
    source === undefined
  ) {
    res.status(400).json({ message: "No fields provided for update." });
    return;
  }

  if (req.body.readingDate !== undefined) {
    res.status(400).json({
      message:
        "Reading date cannot be updated. Please create a new reading for a different date or update an existing one.",
    });
    return;
  }

  try {
    const updatedReading = await prisma.meterReading.update({
      where: {
        id: id,
        userId: userId,
      },
      data: {
        consumptionKWH:
          consumptionKWH !== undefined ? parseFloat(consumptionKWH) : undefined,
        emissionCO2kg:
          emissionCO2kg !== undefined ? parseFloat(emissionCO2kg) : undefined,
        source: source !== undefined ? source : undefined,
        updatedAt: new Date(),
      },
    });

    await updateUserEmbedding(userId);

    res.status(200).json({
      message: "Meter reading updated successfully.",
      reading: updatedReading,
    });

    return;
  } catch (error: any) {
    console.error("Error updating meter reading:", error);
    if (error.code === "P2002") {
      res.status(409).json({
        message: "A reading for this user and updated month already exists.",
        error: error.message,
      });
      return;
    }
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

// Delete Meter Reading for the authenticated user
export const deleteMeterReading = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Reading ID from URL parameter

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const deletedReading = await prisma.meterReading.deleteMany({
      where: {
        id: id,
        userId: userId, // Ensure the reading belongs to the authenticated user
      },
    });

    if (deletedReading.count === 0) {
      res.status(404).json({
        message: "Meter reading not found or does not belong to user.",
      });
      return;
    }

    await updateUserEmbedding(userId);

    res.status(200).json({
      message: "Meter reading deleted successfully.",
    });
    return;
  } catch (error: any) {
    console.error("Error deleting meter reading:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

export const deleteMeterReadingsBulk = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { ids } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "No IDs provided for bulk deletion." });
  }

  if (!ids.every((id) => typeof id === "string" && id.length > 0)) {
    return res
      .status(400)
      .json({
        message:
          "Invalid ID format in the list. All IDs must be non-empty strings.",
      });
  }

  try {
    const deleteResult = await prisma.meterReading.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: userId,
      },
    });

    await updateUserEmbedding(userId);

    return res.status(200).json({
      message: `${deleteResult.count} meter readings deleted successfully.`,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error("Error performing bulk deletion:", error);

    // --- Error Response ---
    // Basic error handling; you can expand this with more specific Prisma error codes if needed.
    return res
      .status(500)
      .json({
        message: "Failed to perform bulk deletion.",
        error: error.message,
      });
  }
};

// upload csv data and handled
export const uploadMeterReadingsCsv = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "No CSV file uploaded." });
    return;
  }

  // Parse the CSV file from buffer
  const csvContent = req.file.buffer.toString("utf8");
  Papa.parse(csvContent, {
    header: true, // Assuming the first row contains headers like 'readingDate', 'consumptionKWH', etc.
    skipEmptyLines: true,
    complete: async (results: any) => {
      const readingsToCreate: any[] = [];
      const errors: string[] = [];

      for (const [index, row] of results.data.entries()) {
        const rowNumber = index + 2; // +1 for 0-indexed, +1 for header row

        const { readingDate, consumptionKWH, emissionCO2kg, source } =
          row as any;

        // Basic validation
        if (
          !readingDate ||
          consumptionKWH === undefined ||
          consumptionKWH === null
        ) {
          errors.push(
            `Row ${rowNumber}: Missing required fields (readingDate, consumptionKWH).`
          );
          continue;
        }

        const parsedDate = new Date(readingDate);
        if (isNaN(parsedDate.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid readingDate format.`);
          continue;
        }
        const firstDayOfMonth = new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          1
        );

        const parsedConsumptionKWH = parseFloat(consumptionKWH);
        if (isNaN(parsedConsumptionKWH)) {
          errors.push(`Row ${rowNumber}: Invalid consumptionKWH value.`);
          continue;
        }

        const parsedEmissionCO2kg = emissionCO2kg
          ? parseFloat(emissionCO2kg)
          : null;
        if (emissionCO2kg && isNaN(parsedEmissionCO2kg!)) {
          errors.push(`Row ${rowNumber}: Invalid emissionCO2kg value.`);
          continue;
        }

        readingsToCreate.push({
          userId: userId,
          readingDate: firstDayOfMonth,
          consumptionKWH: parsedConsumptionKWH,
          emissionCO2kg: parsedEmissionCO2kg,
          source: source || "csv_upload", // Default source for CSV uploads
        });
      }

      if (errors.length > 0) {
        res.status(400).json({
          message: "CSV processing completed with errors.",
          errors: errors,
          processedCount: 0,
        });
        return;
      }

      if (readingsToCreate.length === 0) {
        res
          .status(400)
          .json({ message: "No valid readings found in the CSV to upload." });
        return;
      }

      try {
        const createdReadings = [];
        const updatedReadings = [];
        for (const readingData of readingsToCreate) {
          try {
            const result = await prisma.meterReading.upsert({
              where: {
                userId_readingDate: {
                  userId: readingData.userId,
                  readingDate: readingData.readingDate,
                },
              },
              update: {
                consumptionKWH: readingData.consumptionKWH,
                emissionCO2kg: readingData.emissionCO2kg,
                source: readingData.source,
                updatedAt: new Date(),
              },
              create: readingData,
            });
            if (result) {
              // Check if it was created or updated
              // A simple way is to check the `createdAt` and `updatedAt` timestamps
              // However, prisma.upsert returns the created/updated record, not a flag.
              // For simplicity, we'll just count total upserted.
            }
          } catch (upsertError: any) {
            // If a specific upsert fails, log it but try to continue
            console.warn(
              `Failed to upsert reading for date ${readingData.readingDate.toISOString()} for user ${userId}: ${
                upsertError.message
              }`
            );
            errors.push(
              `Failed to process reading for date ${readingData.readingDate.toISOString()}: ${
                upsertError.message
              }`
            );
          }
        }

        // Re-fetch all readings for the user after processing to return a consolidated list
        const updatedUserReadings = await prisma.meterReading.findMany({
          where: { userId: userId },
          orderBy: { readingDate: "desc" },
        });

        if (errors.length > 0) {
          res.status(207).json({
            message:
              "CSV processing completed with some errors. Partial success.",
            uploadedCount: readingsToCreate.length - errors.length,
            errors: errors,
            readings: updatedUserReadings,
          });
          return;
        }

        await updateUserEmbedding(userId);

        res.status(200).json({
          message: `Successfully uploaded and processed ${readingsToCreate.length} meter readings.`,
          uploadedCount: readingsToCreate.length,
          readings: updatedUserReadings,
        });
        return;
      } catch (dbError: any) {
        console.error("Database error during CSV upload:", dbError);
        res.status(500).json({
          message: "Database error during bulk upload.",
          error: dbError.message,
        });
        return;
      }
    },
    error: (error: any) => {
      console.error("CSV parsing error:", error);
      res
        .status(400)
        .json({ message: "Error parsing CSV file.", error: error.message });
      return;
    },
  });
};

// Get Monthly Consumption Summary for Visualization
export const getMonthlyConsumptionSummary = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.id;


  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    // Aggregate meter readings by month for the authenticated user
    const monthlySummary = await prisma.meterReading.groupBy({
      by: ["readingDate"], // Group by the first day of the month
      where: { userId: userId },
      _sum: {
        consumptionKWH: true,
        emissionCO2kg: true,
      },
      orderBy: {
        readingDate: "asc", // Order chronologically for trends
      },
    });

    // Format the data for easier frontend consumption
    const formattedSummary = monthlySummary.map((item:any) => ({
      month: item.readingDate.toISOString().substring(0, 7), // Format as YYYY-MM
      totalConsumptionKWH: item._sum.consumptionKWH || 0,
      totalEmissionCO2kg: item._sum.emissionCO2kg || 0,
    }));

    res.status(200).json({
      message: "Monthly consumption summary retrieved successfully.",
      summary: formattedSummary,
    });
    return;
  } catch (error: any) {
    console.error("Error retrieving monthly consumption summary:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};
