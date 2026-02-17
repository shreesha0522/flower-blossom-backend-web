import { Router } from "express";

import { upload } from "../middleware/uplaod.middleware";
import { ProfileController } from "../controllers/profile.controller";

const profileController = new ProfileController();
const router = Router();

// POST route to update profile (with optional image)
router.post("/update", upload.single("image"), profileController.updateProfile);

// GET route to get user profile by userId
router.get("/:userId", profileController.getProfile);

export default router;