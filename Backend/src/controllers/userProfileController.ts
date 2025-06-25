import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { updateUserEmbedding } from "../services/updateUserEmbedding";

const prisma = new PrismaClient();

// Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Exclude sensitive data like passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    // Return both user details and their associated userProfile (which contains onboardingComplete)
    res.status(200).json({
      message: "User profile retrieved successfully.",
      user: userWithoutPassword,
      userProfile: user.userProfile,
    });
    return;
  } catch (error: any) {
    console.error("Error retrieving user profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};

// Update User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user ID from middleware
  const {
    firstName,
    lastName,
    phoneNumber,
    householdSize, 
    address,       
    city,          
    state,         
    zipCode,       
    targetReduction,       
    ecoGoals,              
    electricityRatePerKWh, 
    onboardingComplete,    
  } = req.body;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    // Start a Prisma transaction to ensure both User and UserProfile updates succeed or fail together
    const updatedData = await prisma.$transaction(async (tx) => {
      // Update User model fields
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          firstName: firstName !== undefined ? firstName : undefined,
          lastName: lastName !== undefined ? lastName : undefined,
          phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
          householdSize: householdSize !== undefined ? householdSize : undefined,
          address: address !== undefined ? address : undefined,
          city: city !== undefined ? city : undefined,
          state: state !== undefined ? state : undefined,
          zipCode: zipCode !== undefined ? zipCode : undefined,
          updatedAt: new Date(),
        },
      });

      const updatedUserProfile = await tx.userProfile.upsert({
          where: { userId: userId },
          update: {
            targetReduction: targetReduction !== undefined ? targetReduction : undefined,
            ecoGoals: ecoGoals !== undefined ? ecoGoals : undefined,
            electricityRatePerKWh: electricityRatePerKWh !== undefined ? electricityRatePerKWh : undefined,
            onboardingComplete: onboardingComplete !== undefined ? onboardingComplete : undefined, // NEW: Update the onboardingComplete flag
          },
          create: {
            userId: userId,
            targetReduction: targetReduction,
            ecoGoals: ecoGoals,
            electricityRatePerKWh: electricityRatePerKWh,
            onboardingComplete: onboardingComplete !== undefined ? onboardingComplete : false, 
          },
      });

      return { user: updatedUser, userProfile: updatedUserProfile };
    });

    // Exclude sensitive data like passwordHash
    const { passwordHash, ...userWithoutPassword } = updatedData.user;

    // Call updateUserEmbedding after successful updates (assuming this service is relevant to profile changes)
    await updateUserEmbedding(userId);

    res.status(200).json({
      message: "User profile updated successfully.",
      user: userWithoutPassword,
      userProfile: updatedData.userProfile,
    });
    return;
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    if (error.code === "P2025") {
      res
        .status(404)
        .json({ message: "User not found.", error: error.message });
      return;
    }
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    return;
  }
};