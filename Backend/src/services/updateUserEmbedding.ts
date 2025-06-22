// src/services/updateUserEmbedding.ts

import { PrismaClient } from '@prisma/client';
import { supabase, embeddings } from '../utils/vectorStore'; 

const prisma = new PrismaClient();

export const updateUserEmbedding = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        readings: {
          orderBy: { readingDate: 'desc' },
          take: 12,
        },
        appliances: true,
      },
    });

    if (!user || !user.userProfile) {
      console.warn(`User or UserProfile not found for ID: ${userId}. Cannot generate embedding.`);
      return;
    }

    // 1. Prepare the text content to be embedded
    let userEnergyProfileText = `User ID: ${user.id}. `;
    userEnergyProfileText += `Household size: ${user.householdSize || 'unknown'}. `;
    userEnergyProfileText += `Eco goals: ${user.userProfile.ecoGoals || 'not specified'}. `;
    userEnergyProfileText += `Current address: ${user.city || ''}, ${user.state || ''}, ${user.zipCode || ''}. `;

    if (user.readings.length > 0) {
      const recentConsumption = user.readings
        .map((r) => `${r.readingDate.toISOString().substring(0, 7)}: ${r.consumptionKWH} kWh`)
        .join('; ');
      userEnergyProfileText += `Recent monthly consumption (last ${user.readings.length} months): ${recentConsumption}. `;
      const avgConsumption = user.readings.reduce((sum, r) => sum + r.consumptionKWH, 0) / user.readings.length;
      userEnergyProfileText += `Average monthly consumption: ${avgConsumption.toFixed(2)} kWh. `;
    } else {
      userEnergyProfileText += `No meter readings available. `;
    }

    if (user.appliances.length > 0) {
      const applianceDetails = user.appliances
        .map((a) => `${a.type} (Model: ${a.modelName || 'N/A'}, Age: ${a.ageYears || 'N/A'} years, Efficiency: ${a.energyEfficiencyRating || 'N/A'})`)
        .join('; ');
      userEnergyProfileText += `Appliances: ${applianceDetails}.`;
    } else {
      userEnergyProfileText += `No appliances listed.`;
    }

    const userEmbeddingVector = await embeddings.embedQuery(userEnergyProfileText);

    const { data, error } = await supabase.from('user_embeddings').upsert(
      {
        userId: user.id, 
        content: userEnergyProfileText, 
        embedding: userEmbeddingVector, 
        metadata: { userId: user.id, userProfileId: user.userProfile.id, type: 'user_profile' },
      },
      {
        onConflict: 'userId', 
        ignoreDuplicates: false, 
      }
    );

    if (error) {
      throw new Error(`Supabase upsert error: ${error.message}`);
    }

    console.log(`Embedding for user ${userId} upserted successfully. Data:`, data);

  } catch (error: any) {
    console.error(`Error generating or updating embedding for user ${userId}:`, error);
  }
};