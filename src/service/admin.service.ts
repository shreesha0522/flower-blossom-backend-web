import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { UserModel } from "../models/user.model";

export class AdminService {

  
  private deleteImageFromDisk(imagePath: string): void {
    if (imagePath) {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }

  async createUser(data: any, imagePath?: string) {
    const { username, email, password, firstName, lastName, role } = data;

    if (!username || !email || !password) {
      throw { status: 400, message: "Username, email, and password are required" };
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) throw { status: 400, message: "Email already exists" };

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) throw { status: 400, message: "Username already exists" };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData: any = {
      username,
      email,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || "",
      role: role || "user",
    };

    if (imagePath) userData.profileImage = imagePath;

    return await UserModel.create(userData);
  }

  async getAllUsers(query: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalUsers = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return { users, totalUsers, totalPages };
  }

  async getUserById(id: string): Promise<any> {
    const user = await UserModel.findById(id).select("-password");
    if (!user) throw { status: 404, message: "User not found" };
    return user;
  }

  async updateUser(id: string, updateData: any, newImagePath?: string, removeImage?: boolean): Promise<any> {
    const user = await UserModel.findById(id);
    if (!user) throw { status: 404, message: "User not found" };

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await UserModel.findOne({ email: updateData.email });
      if (emailExists) throw { status: 400, message: "Email already exists" };
    }

    if (updateData.username && updateData.username !== user.username) {
      const usernameExists = await UserModel.findOne({ username: updateData.username });
      if (usernameExists) throw { status: 400, message: "Username already exists" };
    }

    
    if (removeImage && user.profileImage) {
      this.deleteImageFromDisk(user.profileImage);
      updateData.profileImage = "";
    }

    if (newImagePath) {
      if (user.profileImage) this.deleteImageFromDisk(user.profileImage);
      updateData.profileImage = newImagePath;
    }

    return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteUser(id: string, currentUserId: string): Promise<any> {
    if (currentUserId === id) {
      throw { status: 400, message: "You cannot delete your own account" };
    }

    const user = await UserModel.findById(id);
    if (!user) throw { status: 404, message: "User not found" };

    
    if (user.profileImage) {
      this.deleteImageFromDisk(user.profileImage);
    }

    await UserModel.findByIdAndDelete(id);
    return user;
  }
}