// src/lib/vectorStore.ts

import { PrismaClient, Prisma } from "@prisma/client";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { UserEmbedding } from "@prisma/client";

const prisma = new PrismaClient();

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-exp-03-07",
});

export const getUserEmbeddingVectorStore = () => {
  return PrismaVectorStore.withModel<UserEmbedding>(prisma).create(
    embeddings,
    {
      prisma: Prisma,
      tableName: "UserEmbedding", 
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,      
        content: PrismaVectorStore.ContentColumn,
        metadata: true,                     
      },
    }
  );
};