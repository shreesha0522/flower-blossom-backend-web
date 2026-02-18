import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

/**
 * @class ProfileController
 * @desc Handles user profile operations including viewing and updating profile information
 */
export class ProfileController {

  /**
   * @desc    Update authenticated user's profile information
   * @route   PUT /api/profile/update
   * @access  Private (Authenticated user - own profile only)
   * @param   {Request} req - Express request object containing userId, name, email, bio, phone in body and optional image file
   * @param   {Response} res - Express response object
   * @returns {Object} Updated profile data with HATEOAS links
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { userId, name, email, bio, phone } = req.body;
      if (!userId || !name || !email) {
        return res.status(400).json({
          success: false,
          message: "userId, name, and email are required",
        });
      }

      const currentUser = (req as any).user;
      if (currentUser.id?.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
      }

      const updateData: any = {
        email,
        bio: bio || null,
        phone: phone || null,
      };

      const nameParts = name.trim().split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ") || "";

      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

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
        _links: {
          self: { href: `/api/profile/${userId}`, method: "GET" },
          update: { href: `/api/profile/update`, method: "PUT" },
          uploadImage: { href: `/api/upload/profile-image`, method: "POST" },
          deleteImage: { href: `/api/upload/profile-image/${userId}`, method: "DELETE" },
        },
      });
    } catch (error: any) {
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

  /**
   * @desc    Get a user's public profile by user ID
   * @route   GET /api/profile/:userId
   * @access  Public
   * @param   {Request} req - Express request object containing userId in params
   * @param   {Response} res - Express response object
   * @returns {Object} User profile data (excludes password) with HATEOAS links
   */
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
        _links: {
          self: { href: `/api/profile/${userId}`, method: "GET" },
          update: { href: `/api/profile/update`, method: "PUT" },
          uploadImage: { href: `/api/upload/profile-image`, method: "POST" },
          deleteImage: { href: `/api/upload/profile-image/${userId}`, method: "DELETE" },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }
}