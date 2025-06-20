import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { updateUserEmbedding } from '../services/updateUserEmbedding';

const prisma = new PrismaClient();

// Add a new Appliance
export const addAppliance = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user ID from middleware
  const {
    type,
    modelName,
    ageYears,
    purchaseDate,
    energyStarRating,
    powerConsumptionWatts,
    energyEfficiencyRating,
    averageDailyUsageHours,
    capacity,
  } = req.body;

  if (!userId || !type) {
    res.status(400).json({ message: 'Missing required fields: userId, type.' });
    return;
  }

  let parsedPurchaseDate: Date | undefined;
  if (purchaseDate) {
    parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      res.status(400).json({ message: 'Invalid purchaseDate format.' });
      return;
    }
  }

  try {
    const newAppliance = await prisma.appliance.create({
      data: {
        userId: userId,
        type: type,
        modelName: modelName,
        ageYears: ageYears !== undefined ? parseInt(ageYears) : undefined,
        purchaseDate: parsedPurchaseDate,
        energyStarRating: energyStarRating,
        powerConsumptionWatts: powerConsumptionWatts !== undefined ? parseFloat(powerConsumptionWatts) : undefined,
        energyEfficiencyRating: energyEfficiencyRating,
        averageDailyUsageHours: averageDailyUsageHours !== undefined ? parseFloat(averageDailyUsageHours) : undefined,
        capacity: capacity,
      },
    });

    await updateUserEmbedding(userId);

    res.status(201).json({
      message: 'Appliance added successfully.',
      appliance: newAppliance,
    });
    return;

  } catch (error: any) {
    console.error('Error adding appliance:', error);
    if (error.code === 'P2003') { // Foreign key constraint failed (user not found)
      res.status(400).json({ message: 'User not found.', error: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// Get All Appliances for the authenticated user
export const getAppliances = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const appliances = await prisma.appliance.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // Order by most recently added first
    });

    res.status(200).json({
      message: 'Appliances retrieved successfully.',
      appliances: appliances,
    });
    return;

  } catch (error: any) {
    console.error('Error retrieving appliances:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// Get a single Appliance by ID for the authenticated user
export const getApplianceById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Appliance ID from URL parameter

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const appliance = await prisma.appliance.findUnique({
      where: {
        id: id,
        userId: userId, // Ensure the appliance belongs to the authenticated user
      },
    });

    if (!appliance) {
      res.status(404).json({ message: 'Appliance not found or does not belong to user.' });
      return;
    }

    res.status(200).json({
      message: 'Appliance retrieved successfully.',
      appliance: appliance,
    });
    return;

  } catch (error: any) {
    console.error('Error retrieving single appliance:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// Update an Appliance for the authenticated user
export const updateAppliance = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Appliance ID from URL parameter
  const {
    type,
    modelName,
    ageYears,
    purchaseDate,
    energyStarRating,
    powerConsumptionWatts,
    energyEfficiencyRating,
    averageDailyUsageHours,
    capacity,
  } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  // At least one field to update must be provided
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: 'No fields provided for update.' });
    return;
  }

  let parsedPurchaseDate: Date | undefined;
  if (purchaseDate !== undefined) {
    parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      res.status(400).json({ message: 'Invalid purchaseDate format.' });
      return;
    }
  }

  try {
    const updatedAppliance = await prisma.appliance.updateMany({
      where: {
        id: id,
        userId: userId, // Ensure the appliance belongs to the authenticated user
      },
      data: {
        type: type !== undefined ? type : undefined,
        modelName: modelName !== undefined ? modelName : undefined,
        ageYears: ageYears !== undefined ? parseInt(ageYears) : undefined,
        purchaseDate: parsedPurchaseDate,
        energyStarRating: energyStarRating !== undefined ? energyStarRating : undefined,
        powerConsumptionWatts: powerConsumptionWatts !== undefined ? parseFloat(powerConsumptionWatts) : undefined,
        energyEfficiencyRating: energyEfficiencyRating !== undefined ? energyEfficiencyRating : undefined,
        averageDailyUsageHours: averageDailyUsageHours !== undefined ? parseFloat(averageDailyUsageHours) : undefined,
        capacity: capacity !== undefined ? capacity : undefined,
        updatedAt: new Date(),
      },
    });

    if (updatedAppliance.count === 0) {
      res.status(404).json({ message: 'Appliance not found or does not belong to user.' });
      return;
    }

    // Fetch the updated record to return it in the response
    const recordToReturn = await prisma.appliance.findUnique({ where: { id: id } });

    await updateUserEmbedding(userId);

    res.status(200).json({
      message: 'Appliance updated successfully.',
      appliance: recordToReturn,
    });
    return;

  } catch (error: any) {
    console.error('Error updating appliance:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// Delete an Appliance for the authenticated user
export const deleteAppliance = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Appliance ID from URL parameter

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const deletedAppliance = await prisma.appliance.deleteMany({
      where: {
        id: id,
        userId: userId, // Ensure the appliance belongs to the authenticated user
      },
    });

    if (deletedAppliance.count === 0) {
      res.status(404).json({ message: 'Appliance not found or does not belong to user.' });
      return;
    }

    await updateUserEmbedding(userId);

    res.status(200).json({
      message: 'Appliance deleted successfully.',
    });
    return;

  } catch (error: any) {
    console.error('Error deleting appliance:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};