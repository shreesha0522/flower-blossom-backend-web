import { Router } from "express";

import { ProfileController } from "../controllers/profile.controller";
import { isAuthenticated } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

const profileController = new ProfileController();
const router = Router();

router.put("/update", isAuthenticated, upload.single("image"), profileController.updateProfile);
router.get("/:userId", profileController.getProfile);

export default router;