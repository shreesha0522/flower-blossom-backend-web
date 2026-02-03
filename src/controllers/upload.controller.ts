import { Request, Response } from "express";
import { UserService } from "../service/user.service";

let userService = new UserService();

export class UploadController {
  // Upload profile image and save to user profile
  async uploadProfileImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Get userId from request body
      const userId = req.body.userId as string;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Get the uploaded file info
      const imageUrl = `/uploads/${req.file.filename}`;

      // Save image URL to user profile in MongoDB
      const updatedUser = await userService.updateProfileImage(userId, imageUrl);

      return res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          user: updatedUser,
          imageUrl: imageUrl,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error uploading image",
        error: error.message,
      });
    }
  }

  // Get user profile image
  async getProfileImage(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;  // ← ADDED 'as string'

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const imageUrl = await userService.getUserProfileImage(userId);

      return res.status(200).json({
        success: true,
        data: {
          imageUrl: imageUrl,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching profile image",
        error: error.message,
      });
    }
  }
}