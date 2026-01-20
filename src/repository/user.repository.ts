import { User, IUser } from "../models/user.model";

export class UserRepository {
  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }

  async createUser(data: { username: string; email: string; password: string; role?: string }) {
    const user = new User(data);
    return user.save();
  }

  // NEW METHOD: Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select("-password"); // Exclude password from result
  }
}