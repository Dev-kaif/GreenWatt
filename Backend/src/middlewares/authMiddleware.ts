import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseCLient'; 

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification error:', error?.message);
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.user = {
      id: user.id,
      email: user.email || undefined,
    };

    next();

  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.', error: error.message });
  }
};