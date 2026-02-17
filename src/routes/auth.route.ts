import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

let authController = new AuthController();
const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.put("/:id", isAuthenticated, upload.single("image"), authController.updateUser);

export default router;