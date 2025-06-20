import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { supabaseAnonKey, supabaseUrl } from './config';

dotenv.config(); // Load environment variables from .env file


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);