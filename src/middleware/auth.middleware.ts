import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";

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

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "No token provided. Authorization denied.");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };

    req.user = decoded;

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
