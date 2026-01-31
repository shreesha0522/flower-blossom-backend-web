import { UserRepository } from "../repository/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";
import { UserModel } from "../models/user.model";  // ← ADD THIS IMPORT

let userRepository = new UserRepository();

export class UserService{
  async createUser(data:CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if(emailCheck) {
      throw new HttpError(403,"Email already in use"); 
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if(usernameCheck){
      throw new HttpError(403,"Username already in use")
    }
    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async loginUser(data: LoginUserDTO){
    const user = await userRepository.getUserByEmail(data.email);
    if(!user) {
      throw new HttpError(404,"No user found")
    }
    const validPassword = await bcryptjs.compare(data.password, user.password);
    if(!validPassword){
      throw new HttpError(401,"Invalid Credentials")
    }
    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "30d"});
    return {token, user};
  }

  // ← ADD THESE TWO METHODS
  async updateProfileImage(userId: string, imageUrl: string) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { profileImage: imageUrl },
        { new: true }
      ).select("-password");

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return user;
    } catch (error: any) {
      throw new HttpError(500, error.message);
    }
  }

  async getUserProfileImage(userId: string) {
    try {
      const user = await UserModel.findById(userId).select("profileImage");
      
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return user.profileImage;
    } catch (error: any) {
      throw new HttpError(500, error.message);
    }
  }
}