import { UserRepository } from "../repository/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";
import { UserModel } from "../models/user.model";

const userRepository = new UserRepository();

/**
 * @class UserService
 * @desc Service layer handling all user-related business logic
 */
export class UserService {

  /**
   * @desc    Create a new user after checking for duplicate email and username
   * @param   {CreateUserDTO} data - User registration data
   * @returns {Promise<IUser>} Newly created user object
   * @throws  {HttpError} 403 if email or username already in use
   */
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) throw new HttpError(403, "Username already in use");

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  /**
   * @desc    Authenticate user with email and password, return JWT token
   * @param   {LoginUserDTO} data - Login credentials
   * @returns {Promise<{token: string, user: IUser}>} JWT token and user object
   * @throws  {HttpError} 404 if user not found, 401 if invalid credentials
   */
  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(404, "No user found");

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid Credentials");

    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }

  /**
   * @desc    Update a user's profile image URL in the database
   * @param   {string} userId - MongoDB user ID
   * @param   {string} imageUrl - New profile image URL
   * @returns {Promise<IUser>} Updated user object without password
   * @throws  {HttpError} 404 if user not found
   */
  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  /**
   * @desc    Retrieve a user's profile image URL
   * @param   {string} userId - MongoDB user ID
   * @returns {Promise<string|null>} Profile image URL or null
   * @throws  {HttpError} 404 if user not found
   */
  async getUserProfileImage(userId: string) {
    const user = await UserModel.findById(userId).select("profileImage");
    if (!user) throw new HttpError(404, "User not found");
    return user.profileImage;
  }

  /**
   * @desc    Delete a user's profile image by setting it to null
   * @param   {string} userId - MongoDB user ID
   * @returns {Promise<IUser>} Updated user object without password
   * @throws  {HttpError} 404 if user not found
   */
  async deleteProfileImage(userId: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { profileImage: null },
      { new: true }
    ).select("-password");
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }
}