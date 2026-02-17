import { Router } from "express";

import { upload } from "../middleware/uplaod.middleware";
import { ProfileController } from "../controllers/profile.controller";

const profileController = new ProfileController();
const router = Router();

router.post("/update", upload.single("image"), profileController.updateProfile);

router.get("/:userId", profileController.getProfile);

export default router;