import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

export class AdminController {

  createUser = async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Username, email, and password are required" });
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername) return res.status(400).json({ success: false, message: "Username already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData: any = { username, email, password: hashedPassword, firstName: firstName || "", lastName: lastName || "", role: role || "user" };
      if (req.file) userData.profileImage = `/uploads/${req.file.filename}`;

      const newUser = await UserModel.create(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          profileImage: newUser.profileImage,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to create user" });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const search = (req.query.search as string) || "";
      const role = (req.query.role as string) || "";

      const query: any = {};
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ];
      }

      if (role && ["user", "admin"].includes(role)) query.role = role;

      const totalUsers = await UserModel.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit);

      const users = await UserModel.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to fetch users" });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to fetch user" });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { username, email, firstName, lastName, role, bio, phone, removeImage } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });

      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) return res.status(400).json({ success: false, message: "Email already exists" });
      }

      if (username && username !== existingUser.username) {
        const usernameExists = await UserModel.findOne({ username });
        if (usernameExists) return res.status(400).json({ success: false, message: "Username already exists" });
      }

      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (role) updateData.role = role;
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
          createdAt: updatedUser?.createdAt,
          updatedAt: updatedUser?.updatedAt,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to update user" });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (currentUser.id === id || currentUser._id?.toString() === id) {
        return res.status(400).json({ success: false, message: "You cannot delete your own account" });
      }

      const user = await UserModel.findById(id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (user.profileImage) {
        const imagePath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      await UserModel.findByIdAndDelete(id);

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to delete user" });
    }
  };
}
