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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class AuthController {
  register = async (req: Request, res: Response) => {
    try {
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
      return res.status(error.status ?? error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
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
      return res.status(error.status ?? error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

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
      if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });

      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio || null;
      if (phone !== undefined) updateData.phone = phone || null;

      if (removeImage === "true" && existingUser.profileImage) {
        const oldImagePath = path.join(process.cwd(), existingUser.profileImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        updateData.profileImage = "";
      }

      if (req.file) {
        if (existingUser.profileImage) {
          const oldImagePath = path.join(process.cwd(), existingUser.profileImage);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

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
      return res.status(error.status ?? error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: "Email is required" });

      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ success: false, message: "No account found with this email" });

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>Hello ${user.username},</p>
          <p>Click to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link expires in 1 hour.</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error: any) {
      return res.status(error.status ?? error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Failed to send reset email",
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const token = req.params.token as string;
      const { newPassword } = req.body;

      if (!newPassword) return res.status(400).json({ success: false, message: "New password is required" });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = null as any;
      user.resetPasswordExpires = null as any;
      await user.save();

      return res.status(200).json({ success: true, message: "Password reset successful! You can now login." });
    } catch (error: any) {
      return res.status(error.status ?? error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  };
}