// src/lib/vectorStore.ts (or similar utility file)

import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SUPABASE_SERVICE_ROLE_KEY, supabaseUrl } from "../config/config";


// Initialize Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY
);

// Initialize LangChain's Google Generative AI Embeddings
export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-exp-03-07",
});

export const getSupabaseVectorStore = async (
  tableName: string = "user_embeddings",
  queryName: string = "match_user_embeddings"
) => {
  return new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: tableName,
    queryName: queryName,
  });
};
