import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middlewares";


const router = Router();
const authController = new AuthController();

// ================= AUTH ROUTES =================
// Register
router.post("/register", authController.register.bind(authController));

// Login
router.post("/login", authController.login.bind(authController));

// Get current user (protected with verifyToken middleware)
router.get("/me", verifyToken, authController.me.bind(authController));

export default router;