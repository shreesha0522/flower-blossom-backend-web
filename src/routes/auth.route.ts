import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

let authController = new AuthController();
const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

export default router;

