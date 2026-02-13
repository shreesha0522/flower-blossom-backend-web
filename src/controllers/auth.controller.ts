import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserModel } from "../models/user.model";
import z from "zod";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const userService = new UserService();

// ✅ Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class AuthController {
  // Register user
  register = async (req: Request, res: Response) => {
    try {
      console.log("REGISTER BODY:", req.body);

      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: "User created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  };

  // Login user
  login = async (req: Request, res: Response) => {
    try {
      console.log("LOGIN BODY:", req.body);

      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(userData);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
        token,
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  // Update user profile
  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (currentUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
      }

      const { firstName, lastName, email, bio, phone, removeImage } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      const updateData: any = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio || null;
      if (phone !== undefined) updateData.phone = phone || null;

      if (removeImage === "true") {
        if (existingUser.profileImage) {
          const oldImagePath = path.join(process.cwd(), existingUser.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("🗑️ Old image deleted:", oldImagePath);
          }
        }
        updateData.profileImage = "";
      }

      if (req.file) {
        if (existingUser.profileImage) {
          const oldImagePath = path.join(process.cwd(), existingUser.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("🗑️ Old image deleted:", oldImagePath);
          }
        }
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      console.log("✅ User updated:", updatedUser?.email);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          id: updatedUser?._id,
          username: updatedUser?.username,
          email: updatedUser?.email,
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName,
          bio: updatedUser?.bio,
          phone: updatedUser?.phone,
          role: updatedUser?.role,
          profileImage: updatedUser?.profileImage,
        },
      });
    } catch (error: any) {
      console.error("❌ Update user error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  };

  // 👇 NEW: Forgot Password
  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash token before saving to database
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Save hashed token and expiry to user
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // ✅ CHANGED: Using CLIENT_URL instead of FRONTEND_URL
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🔐 Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Password Reset</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p>Hello <strong>${user.username}</strong>,</p>
              <p>You requested to reset your password. Click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p>Or copy this link:</p>
              <p style="background-color: white; padding: 10px; word-break: break-all; border: 1px solid #ddd;">
                ${resetUrl}
              </p>
              
              <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link expires in <strong>1 hour</strong></li>
                  <li>If you didn't request this, ignore this email</li>
                </ul>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© 2024 Your App. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      console.log("✅ Password reset email sent to:", email);

      return res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error: any) {
      console.error("❌ Forgot password error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send reset email",
      });
    }
  };

  // 👇 NEW: Reset Password
resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string; // ✅ Type assertion
    const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      // Hash the token from URL
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find user with valid token
      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = null as any;
      user.resetPasswordExpires = null as any;
      await user.save();

      console.log("✅ Password reset successful for:", user.email);

      return res.status(200).json({
        success: true,
        message: "Password reset successful! You can now login.",
      });
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  };
}