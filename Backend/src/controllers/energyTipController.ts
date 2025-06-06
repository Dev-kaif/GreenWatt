import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get All Personalized Energy Tips for the authenticated user
export const getEnergyTips = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const tips = await prisma.energyTip.findMany({
      where: { userId: userId },
      include: {
        generalTip: { // Include details from the GeneralEnergyTip if linked
          select: {
            title: true,
            description: true,
            category: true,
            ecoLink: true,
            imageUrl: true,
          },
        },
        contextReading: { // Include details about the contextual meter reading if linked
          select: {
            readingDate: true,
            consumptionKWH: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Order by most recently added first
    });

    res.status(200).json({
      message: 'Energy tips retrieved successfully.',
      tips: tips,
    });
    return;

  } catch (error: any) {
    console.error('Error retrieving energy tips:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// Update status (isDismissed, isImplemented) of a Personalized Energy Tip
export const updateEnergyTipStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // Tip ID from URL parameter
  const { isDismissed, isImplemented } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  // Ensure at least one status field is provided
  if (isDismissed === undefined && isImplemented === undefined) {
    res.status(400).json({ message: 'No status fields provided for update (isDismissed or isImplemented).' });
    return;
  }

  // Type check for boolean values
  if ((isDismissed !== undefined && typeof isDismissed !== 'boolean') ||
      (isImplemented !== undefined && typeof isImplemented !== 'boolean')) {
    res.status(400).json({ message: 'isDismissed and isImplemented must be boolean values.' });
    return;
  }

  try {
    const updatedTip = await prisma.energyTip.updateMany({
      where: {
        id: id,
        userId: userId, // Ensure the tip belongs to the authenticated user
      },
      data: {
        isDismissed: isDismissed !== undefined ? isDismissed : undefined,
        isImplemented: isImplemented !== undefined ? isImplemented : undefined,
        updatedAt: new Date(),
      },
    });

    if (updatedTip.count === 0) {
      res.status(404).json({ message: 'Energy tip not found or does not belong to user.' });
      return;
    }

    // Fetch the updated record to return it in the response
    const recordToReturn = await prisma.energyTip.findUnique({
      where: { id: id },
      include: {
        generalTip: {
          select: {
            title: true,
            description: true,
            category: true,
            ecoLink: true,
            imageUrl: true,
          },
        },
        contextReading: {
          select: {
            readingDate: true,
            consumptionKWH: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Energy tip status updated successfully.',
      tip: recordToReturn,
    });
    return;

  } catch (error: any) {
    console.error('Error updating energy tip status:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};

// --- Admin-only functionality for GeneralEnergyTip ---
// These would typically be part of a separate admin API scope with stronger access control.
// Example: Add a new General Energy Tip (for admin user)
/*
export const addGeneralEnergyTip = async (req: Request, res: Response) => {
  // Assuming 'admin' role check here via middleware
  // if (!req.user?.role || req.user.role !== 'admin') { ... }
  const { title, description, category, ecoLink, imageUrl } = req.body;

  if (!title || !description) {
    res.status(400).json({ message: 'Title and description are required for a general tip.' });
    return;
  }

  try {
    const newGeneralTip = await prisma.generalEnergyTip.create({
      data: {
        title,
        description,
        category,
        ecoLink,
        imageUrl,
      },
    });

    res.status(201).json({
      message: 'General energy tip added successfully.',
      tip: newGeneralTip,
    });
    return;

  } catch (error: any) {
    console.error('Error adding general energy tip:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
    return;
  }
};
*/