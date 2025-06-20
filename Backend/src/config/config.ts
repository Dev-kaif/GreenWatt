import dotenv from 'dotenv';

dotenv.config();

export const FRONTEND_URL = process.env.FRONTEND_URL as string
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string
export const supabaseUrl = process.env.SUPABASE_URL as string;
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;