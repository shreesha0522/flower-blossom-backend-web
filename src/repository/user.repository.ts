import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
  createUser(userData: Partial<IUser>) : Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(userName: string) : Promise<IUser | null>;

  getUserById(id: string) : Promise<IUser | null>;
  updateUser(id: string, updatedData:Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;

}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }
  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({"email": email});
    return user;
  }
  async getUserByUsername(userName: string): Promise<IUser | null> {
    const user = await UserModel.findOne({"username": userName});
    return user;
  }
  async getUserById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    return user;
  }
  async updateUser(id: string, updatedData: Partial<IUser>): Promise<IUser | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {new: true});
    return updatedUser;
  }
  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result? true : false
  }
}