import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import fs from "fs";
import path from "path";

let userService = new UserService();

/**
 * @class UploadController
 * @desc Handles profile image upload, retrieval and deletion operations
 */
export class UploadController {

  /**
   * @desc    Upload a profile image for a user
   * @route   POST /api/upload/profile-image
   * @access  Public
   * @param   {Request} req - Express request object containing userId in body and image file as multipart/form-data
   * @param   {Response} res - Express response object
   * @returns {Object} Updated user data and image URL with HATEOAS links
   */
  async uploadProfileImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const userId = req.body.userId as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await userService.updateProfileImage(userId, imageUrl);

      return res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          user: updatedUser,
          imageUrl: imageUrl,
        },
        _links: {
          self: { href: `/api/upload/profile-image`, method: "POST" },
          getImage: { href: `/api/upload/profile-image/${userId}`, method: "GET" },
          deleteImage: { href: `/api/upload/profile-image/${userId}`, method: "DELETE" },
          getProfile: { href: `/api/profile/${userId}`, method: "GET" },
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

  /**
   * @desc    Get the profile image URL for a user
   * @route   GET /api/upload/profile-image/:userId
   * @access  Public
   * @param   {Request} req - Express request object containing userId in params
   * @param   {Response} res - Express response object
   * @returns {Object} Image URL data with HATEOAS links, imageUrl is null if no image set
   */
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
        data: { imageUrl },
        _links: {
          self: { href: `/api/upload/profile-image/${userId}`, method: "GET" },
          upload: { href: `/api/upload/profile-image`, method: "POST" },
          delete: { href: `/api/upload/profile-image/${userId}`, method: "DELETE" },
          getProfile: { href: `/api/profile/${userId}`, method: "GET" },
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

  /**
   * @desc    Delete the profile image for a user
   * @route   DELETE /api/upload/profile-image/:userId
   * @access  Public
   * @param   {Request} req - Express request object containing userId in params
   * @param   {Response} res - Express response object
   * @returns {Object} Success message with HATEOAS links
   */
  async deleteProfileImage(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const imageUrl = await userService.getUserProfileImage(userId);
      if (imageUrl) {
        const filename = imageUrl.replace("/uploads/", "");
        const filePath = path.join(__dirname, "../../uploads", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await userService.deleteProfileImage(userId);

      return res.status(200).json({
        success: true,
        message: "Profile image deleted successfully",
        _links: {
          self: { href: `/api/upload/profile-image/${userId}`, method: "DELETE" },
          upload: { href: `/api/upload/profile-image`, method: "POST" },
          getProfile: { href: `/api/profile/${userId}`, method: "GET" },
        },
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