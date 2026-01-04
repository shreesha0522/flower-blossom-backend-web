import { UserRepository } from "../repository/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userRepository = new UserRepository();

export class UserService{
  async createUser(data:CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);

    if(emailCheck) {
      throw new Error("Email already in use"); 
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const usernameCheck = await userRepository.getUserByUsername(data.username);

    if(usernameCheck){
      throw new Error("Username already in use")
    }

    const newUser = await userRepository.createUser(data);

    return newUser;
  }

  async loginUser(data: LoginUserDTO){
    const user = await userRepository.getUserByEmail(data.email);
    if(!user) {
      throw new Error("No user found")
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if(!validPassword){
      throw new Error("Invalid Credentials")
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
}