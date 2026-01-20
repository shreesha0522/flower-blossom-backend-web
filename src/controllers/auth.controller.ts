import { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

const userService = new UserService();

export class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      console.log("REGISTER BODY:", req.body);
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.format(),
        });
      }

      const userData = parsedData.data;
      const { user, token } = await userService.createUser(userData);

      // Cookie settings - accessible on frontend
      const cookieOptions = {
        httpOnly: false, // CHANGED: Allow JavaScript to read
        secure: false, // CHANGED: Set to false for localhost
        sameSite: 'lax' as const, // CHANGED: Use 'lax' for same-site cookies
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
        domain: 'localhost' // ADDED: Works for all localhost ports
      };

      // Set auth_token cookie
      res.cookie('auth_token', token, cookieOptions);

      // Set user_data cookie
      res.cookie('user_data', JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }), cookieOptions);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      console.log("LOGIN BODY:", req.body);
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.format(),
        });
      }

      const userData = parsedData.data;
      const { token, user } = await userService.loginUser(userData);

      // Cookie settings - accessible on frontend
      const cookieOptions = {
        httpOnly: false, // CHANGED: Allow JavaScript to read
        secure: false, // CHANGED: Set to false for localhost
        sameSite: 'lax' as const, // CHANGED: Use 'lax' for same-site cookies
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
        domain: 'localhost' // ADDED: Works for all localhost ports
      };

      // Set auth_token cookie
      res.cookie('auth_token', token, cookieOptions);

      // Set user_data cookie
      res.cookie('user_data', JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }), cookieOptions);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id || req.user._id || req.user.userId;
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message ?? "Failed to get user data",
      });
    }
  };
}