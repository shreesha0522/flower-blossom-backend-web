import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

let authController = new AuthController();
const router = Router();

// ✅ Existing routes (not changed)
router.post("/login", authController.login);
router.post("/register", authController.register);

// ✅ NEW: Update user profile with optional image
// PUT /api/auth/:id
router.put("/:id", isAuthenticated, upload.single("image"), authController.updateUser);

export default router;