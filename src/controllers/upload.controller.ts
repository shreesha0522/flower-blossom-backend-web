import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import fs from "fs";
import path from "path";

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
      const userId = req.params.userId as string;
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

  // Delete user profile image
  async deleteProfileImage(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Get the current image URL from database
      const imageUrl = await userService.getUserProfileImage(userId);

      if (imageUrl) {
        // Delete the physical file from uploads folder
        const filename = imageUrl.replace("/uploads/", "");
        const filePath = path.join(__dirname, "../../uploads", filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File deleted:", filePath);
        }
      }

      // Remove image URL from user profile in database
      await userService.deleteProfileImage(userId);

      return res.status(200).json({
        success: true,
        message: "Profile image deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error deleting profile image",
        error: error.message,
      });
    }
  }
}