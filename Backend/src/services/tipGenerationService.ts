// src/services/tipGenerationService.ts

import { PrismaClient } from "@prisma/client";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getSupabaseVectorStore } from "../utils/vectorStore"; // Assuming this path is correct
import { HumanMessage } from "@langchain/core/messages";
import { GEMINI_API_KEY } from "../config/config"; // Assuming GEMINI_API_KEY is available here

const prisma = new PrismaClient();

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY, // Ensure this is securely handled in your environment
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold **text**
    .replace(/\*(.*?)\*/g, "$1") // italic *text*
    .replace(/_(.*?)_/g, "$1") // italic _text_
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/#+\s+(.*)/g, "$1") // headings
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // markdown links
    .replace(/^\s*[-*]\s+/gm, "") // bullet points
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/>\s?(.*)/g, "$1") // blockquotes
    .replace(/\n{2,}/g, "\n\n") // normalize excessive spacing
    .trim();
}

// This function will fetch a simplified summary of user data to feed into the LLM prompt.
export const getUserContextForTips = async (userId: string) => {
  try {
    // Fetch recent meter readings (e.g., last 3 months)
    const recentReadings = await prisma.meterReading.findMany({
      where: { userId },
      orderBy: { readingDate: "desc" },
      take: 3, // Get last 3 months
      select: {
        readingDate: true,
        consumptionKWH: true,
        emissionCO2kg: true,
      },
    });

    // Fetch user's appliances
    const userAppliances = await prisma.appliance.findMany({
      where: { userId },
      select: {
        type: true,
        modelName: true,
        powerConsumptionWatts: true,
        averageDailyUsageHours: true,
        energyEfficiencyRating: true,
      },
    });

    // Fetch basic user profile info (household size, ecoGoals, targetReduction)
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        householdSize: true,
        city: true,
        state: true,
        userProfile: {
          select: {
            targetReduction: true,
            ecoGoals: true,
          },
        },
      },
    });

    // Format data into a concise string
    let contextString = "";
    if (userProfile) {
      contextString += `User Profile: Household Size: ${
        userProfile.householdSize || "N/A"
      }, `;
      contextString += `Location: ${userProfile.city || "N/A"}, ${
        userProfile.state || "N/A"
      }. `;
      if (userProfile.userProfile) {
        contextString += `Eco Goals: "${
          userProfile.userProfile.ecoGoals || "Not specified"
        }". `;
        contextString += `Target Reduction: ${
          userProfile.userProfile.targetReduction || "Not set"
        }%. `;
      }
    }

    if (recentReadings && recentReadings.length > 0) {
      contextString += `Recent Consumption (last ${recentReadings.length} months): `;
      recentReadings.forEach((reading) => {
        contextString += `${new Date(reading.readingDate).toLocaleString(
          "en-US",
          { month: "short", year: "numeric" }
        )}: ${reading.consumptionKWH} kWh, `;
      });
    }

    if (userAppliances && userAppliances.length > 0) {
      contextString += `Appliances: `;
      userAppliances.forEach((appliance) => {
        contextString += `${appliance.type} (Model: ${
          appliance.modelName || "N/A"
        }, Power: ${appliance.powerConsumptionWatts || "N/A"}W, Efficiency: ${
          appliance.energyEfficiencyRating || "N/A"
        }), `;
      });
    }

    return contextString.trim(); // Return the constructed context string
  } catch (error) {
    console.error("Error getting user context for tips:", error);
    return "";
  }
};

// This function now uses LangChain's vector store for similarity search
export const findSimilarUsersContext = async (
  userId: string,
  limit: number = 3
) => {
  try {
    const vectorStore = await getSupabaseVectorStore(
      "user_embeddings",
      "match_documents" // Assuming your Supabase function is named 'match_documents'
    );

    // Fetch the current user's profile data to create a query embedding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        readings: { orderBy: { readingDate: "desc" }, take: 12 },
        appliances: true,
      },
    });

    if (!user) return "";

    // Reconstruct the text content of the current user's profile for embedding query
    let currentUserProfileTextForEmbedding = `User ID: ${user.id}. `;
    currentUserProfileTextForEmbedding += `Household size: ${
      user.householdSize || "unknown"
    }. `;
    currentUserProfileTextForEmbedding += `Eco goals: ${
      user.userProfile?.ecoGoals || "not specified"
    }. `;
    currentUserProfileTextForEmbedding += `Current address: ${
      user.city || ""
    }, ${user.state || ""}, ${user.zipCode || ""}. `;

    if (user.readings.length > 0) {
      const recentConsumption = user.readings
        .map(
          (r) =>
            `${r.readingDate.toISOString().substring(0, 7)}: ${
              r.consumptionKWH
            } kWh`
        )
        .join("; ");
      currentUserProfileTextForEmbedding += `Recent monthly consumption (last ${user.readings.length} months): ${recentConsumption}. `;
      const avgConsumption =
        user.readings.reduce((sum, r) => sum + r.consumptionKWH, 0) /
        user.readings.length;
      currentUserProfileTextForEmbedding += `Average monthly consumption: ${avgConsumption.toFixed(
        2
      )} kWh. `;
    } else {
      currentUserProfileTextForEmbedding += `No meter readings available. `;
    }

    if (user.appliances.length > 0) {
      const applianceDetails = user.appliances
        .map(
          (a) =>
            `${a.type} (Model: ${a.modelName || "N/A"}, Age: ${
              a.ageYears || "N/A"
            } years, Efficiency: ${a.energyEfficiencyRating || "N/A"})`
        )
        .join("; ");
      currentUserProfileTextForEmbedding += `Appliances: ${applianceDetails}.`;
    } else {
      currentUserProfileTextForEmbedding += `No appliances listed.`;
    }

    // Use LangChain's similaritySearch to find similar documents (user profiles)
    const similarDocs = await vectorStore.similaritySearch(
      currentUserProfileTextForEmbedding, // Query text to find similar embeddings
      limit + 1, // Fetch one more than needed to exclude self if not already filtered by DB function
      // Filter out the current user's own document based on metadata
      { userId_ne: userId } // Assuming 'userId_ne' filter works with your vector store integration
    );

    let context = "";
    const filteredDocs = similarDocs.filter(
      (doc) => doc.metadata.userId !== userId
    ); // Double-check self-exclusion
    const relevantDocs = filteredDocs.slice(0, limit); // Take only the requested limit

    if (relevantDocs && relevantDocs.length > 0) {
      context = `\n\nInsights from similar users with similar energy patterns:\n`;
      relevantDocs.forEach((doc, index) => {
        const similarUserId = doc.metadata.userId;
        const similarUserContent = doc.pageContent; // The text content of the similar user's profile
        context += `- Similar user ${
          index + 1
        } (ID: ${similarUserId}) profile snippet:\n"${similarUserContent.substring(
          0,
          Math.min(similarUserContent.length, 200) // Trim content to avoid excessively long prompts
        )}..."\n`;
      });
    }
    return context;
  } catch (error) {
    console.error("Error finding similar users context:", error);
    return "";
  }
};

// Modified: generatePersonalizedTips now accepts an optional userQuery
export const generatePersonalizedTips = async (
  userId: string,
  userQuery?: string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        readings: {
          orderBy: { readingDate: "desc" },
          take: 12,
        },
        appliances: true,
      },
    });

    if (!user || !user.userProfile) {
      return [
        {
          tipText:
            "Please complete your profile and add some meter readings for personalized tips!",
        },
      ];
    }

    const currentUserContext = `
User Profile:
- Household Size: ${user.householdSize || "Unknown"}
- Eco Goals: "${user.userProfile.ecoGoals || "Not specified"}"
- Target Reduction: ${
      user.userProfile.targetReduction
        ? `${user.userProfile.targetReduction}%`
        : "Not set"
    }
- Location: ${user.city || "Unknown"}, ${user.state || "Unknown"}

Recent Energy Consumption (kWh, CO2):
${
  user.readings.length > 0
    ? user.readings
        .map(
          (r) =>
            `- ${r.readingDate.toISOString().substring(0, 7)}: ${
              r.consumptionKWH
            } kWh (${r.emissionCO2kg || 0} kg CO₂)`
        )
        .join("\n")
    : "No recent meter readings available."
}

Appliances:
${
  user.appliances.length > 0
    ? user.appliances
        .map(
          (a) =>
            `- ${a.type} (Model: ${a.modelName || "N/A"}, ${
              a.powerConsumptionWatts || "?"
            }W, Efficiency: ${a.energyEfficiencyRating || "N/A"}, Used: ${
              a.averageDailyUsageHours || "?"
            } hrs/day)`
        )
        .join("\n")
    : "No appliances listed."
}
    `;

    // const similarUsersContext = await findSimilarUsersContext(userId, 3);

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are GreenWatt AI, a friendly and expert energy efficiency assistant for households.

        Your goal is to give **precise, personalized, and practical** energy-saving advice using the user's query and household energy profile.

        Instructions:
        - Analyze the user's query and their energy usage data.
        - Focus on **one actionable tip** that has the **most potential impact**.
        - Keep the response concise and structured:
          1. A short friendly intro referencing the user's situation.
          2. One clear, specific energy-saving action.
          3. A concrete benefit (e.g., save X%, reduce Y kWh/month, lower bill by ₹Z).
          4. A follow-up offer to help further or explore more options.
        - If the user query is missing, too broad, or unclear, give a useful general tip based on the provided energy usage.
        - Avoid repeating context back to the user. Focus on **insightful, helpful action**.

        Tone: Friendly, confident, and practical — like a helpful expert, not a chatbot.`,
      ],
      [
        "human",
        `Here is the user's energy usage and household profile:\n\n{currentUserContext}
        The user asked:\n"{userQuery}"

        Please provide a personalized, impactful energy-saving tip.`,
      ],
    ]);

    const chain = RunnableSequence.from([
      promptTemplate,
      chatModel,
      new StringOutputParser(),
    ]);

    const generatedText = await chain.invoke({
      currentUserContext: currentUserContext.trim(),
      // similarUsersContext: similarUsersContext.trim(),
      userQuery: userQuery || "No specific question provided",
    });

    // Optional: Clean up generic AI openers
    const cleanedText = stripMarkdown(
      generatedText
        .replace(/^okay[,.\s]*/i, "") 
        .replace(/^I understand.*?:\s*/i, "") 
        .trim()
    );

    const newTip = await prisma.energyTip.create({
      data: {
        userId: userId,
        generalTipId: null,
        tipText: cleanedText,
      },
    });

    return [newTip];
  } catch (error: any) {
    console.error(
      `Error generating personalized tips for user ${userId} with query "${userQuery}":`,
      error
    );
    return [
      {
        tipText:
          "I'm sorry, I'm having trouble generating tips right now. Please try again shortly!",
      },
    ];
  }
};
