import dotenv from 'dotenv';

dotenv.config();

export const FRONTEND_URL = process.env.FRONTEND_URL as string
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string

export const JWT_SECRET = process.env.JWT_SECRET as string