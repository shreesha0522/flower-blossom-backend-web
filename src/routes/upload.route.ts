import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { upload } from "../middleware/uplaod.middleware";

let uploadController = new UploadController();
const router = Router();

// POST route to upload profile image
router.post("/profile-image", upload.single("image"), uploadController.uploadProfileImage);

// GET route to get user profile image
router.get("/profile-image/:userId", uploadController.getProfileImage);

// DELETE route to delete profile image
router.delete("/profile-image/:userId", uploadController.deleteProfileImage);

export default router;