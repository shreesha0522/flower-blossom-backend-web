import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    const parsedData = CreateUserDTO.safeParse(req.body);
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    try {
      const newUser = await userService.createUser(parsedData.data);
      return res.status(201).json({ success: true, message: "User created", data: newUser });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const parsedData = LoginUserDTO.safeParse(req.body);
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    try {
      const { token, user } = await userService.loginUser(parsedData.data);
      return res.status(200).json({ success: true, message: "Login successful", data: user, token });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
