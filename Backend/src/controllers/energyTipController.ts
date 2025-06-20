// src/controllers/energyTipController.ts
import { Request, Response } from 'express';
// Assuming generatePersonalizedTips is the service that calls LangChain and Gemini
import { generatePersonalizedTips } from '../services/tipGenerationService';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient to fetch historical tips

const prisma = new PrismaClient(); // Initialize PrismaClient

// Controller for generating personalized tips (now can take a user query)
export const generateTipsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    // Allow an optional 'query' for the chatbot interaction
    const userQuery = req.query.q ? String(req.query.q) : undefined; // Get query from URL params

    if (!userId) {
      res.status(400).json({ error: 'User ID not found in authentication token. Please ensure you are logged in.' });
      return;
    }

    // Call the service function, passing the userQuery
    // The service will handle integrating this into the LLM prompt
    const tips = await generatePersonalizedTips(userId, userQuery);

    res.status(200).json({
      message: 'Personalized energy tips generated successfully!',
      tipsCount: tips.length,
      generatedTips: tips, // Renamed from 'tips' to 'generatedTips' for clarity
    });

  } catch (error: any) {
    console.error('[Controller] Error in generateTipsController:', error);
    res.status(500).json({
      error: 'Failed to generate personalized tips.',
      details: error.message || 'An unexpected error occurred.',
      // Optionally, provide fallback tips here if you want the frontend to always display something
      generatedTips: ["Failed to generate new tips. Please try again later."],
    });
  }
};

// NEW: Controller to get all historical energy tips for the authenticated user
export const getTipsHistoryController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  try {
    const historicalTips = await prisma.energyTip.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // Latest tips first
      select: {
        id: true,
        tipText: true,
        createdAt: true,
      }
    });

    res.status(200).json({
      message: 'Historical energy tips retrieved successfully.',
      tips: historicalTips,
    });
    return;

  } catch (error: any) {
    console.error('[Controller] Error in getTipsHistoryController:', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    });
    return;
  }
};