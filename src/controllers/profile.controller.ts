import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

export class ProfileController {
  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { userId, name, email, bio, phone } = req.body;

      // Validate required fields
      if (!userId || !name || !email) {
        return res.status(400).json({
          success: false,
          message: "userId, name, and email are required",
        });
      }

      // Prepare update data
      const updateData: any = {
        email,
        bio: bio || null,
        phone: phone || null,
      };

      // Handle name - split into firstName and lastName
      const nameParts = name.trim().split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ") || "";

      // If image was uploaded, update profileImage field
      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      // Find and update user
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      console.log("✅ Profile updated:", updatedUser);

      // Send success response
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        imageUrl: updatedUser.profileImage,
        data: {
          id: updatedUser._id,
          name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
          email: updatedUser.email,
          bio: updatedUser.bio || null,
          phone: updatedUser.phone || null,
          image: updatedUser.profileImage,
        },
      });
    } catch (error: any) {
      console.error("❌ Profile update error:", error);

      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  }

  // Get user profile by userId
  async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email,
          bio: user.bio || null,
          phone: user.phone || null,
          image: user.profileImage,
        },
      });
    } catch (error: any) {
      console.error("❌ Get profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }
}