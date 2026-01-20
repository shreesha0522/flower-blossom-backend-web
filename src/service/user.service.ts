import { UserRepository } from "../repository/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";
import { z } from "zod";

type CreateUserInput = z.infer<typeof CreateUserDTO>;
type LoginUserInput = z.infer<typeof LoginUserDTO>;

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserInput) {
    if (await userRepository.getUserByEmail(data.email)) {
      throw new HttpError(403, "Email already in use");
    }
    if (await userRepository.getUserByUsername(data.username)) {
      throw new HttpError(403, "Username already in use");
    }

    data.password = await bcryptjs.hash(data.password, 10);
    const user = await userRepository.createUser(data);

    // Generate token for new user
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { user, token };
  }

  async loginUser(data: LoginUserInput) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(404, "No user found");

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid Credentials");

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { token, user };
  }

  // NEW METHOD: Get user by ID
  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }
}