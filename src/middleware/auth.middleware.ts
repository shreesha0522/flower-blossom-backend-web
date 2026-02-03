import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate user using JWT token
 * Expects Authorization header: Bearer <token>
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "No token provided. Authorization denied.");
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };

    // Attach user info to request object
    req.user = decoded;

    // Proceed to next middleware/controller
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      next(new HttpError(401, "Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      next(new HttpError(401, "Token has expired"));
    } else {
      next(error);
    }
  }
};