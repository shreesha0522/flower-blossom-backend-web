import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ✅ Step 1: First check if user is logged in (has valid token)
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    // Token comes like: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in first.",
      });
    }

    // Remove "Bearer " from the token string
    const token = authHeader.split(" ")[1];

    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };

    // Attach decoded user data to the request object
    // So we can use it in the next middleware or route handler
    (req as any).user = decoded;

    // Move to the next middleware or route
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// ✅ Step 2: Then check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the user from the request (attached by isAuthenticated)
    const user = (req as any).user;

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // Check if user role is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can access this resource.",
      });
    }

    // User is admin, move to next middleware or route
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
};
