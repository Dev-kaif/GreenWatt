import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

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

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization token required." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };

    req.user = {
      id: decoded.userId,
      email: decoded.email || undefined,
    };

    next();
  } catch (error: any) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired, please log in again." });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token, authorization denied." });
      return;
    }

    res.status(500).json({
      message: "Internal server error during authentication.",
      error: error.message,
    });
    return;
  }
};
