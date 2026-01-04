import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";


const router = Router();
const authController = new AuthController();

// Register route
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;
