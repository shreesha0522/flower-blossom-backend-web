import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { upload } from "../middleware/uplaod.middleware";

const uploadController = new UploadController();
const router = Router();

router.post("/profile-image", upload.single("image"), uploadController.uploadProfileImage);
router.get("/profile-image/:userId", uploadController.getProfileImage);
router.delete("/profile-image/:userId", uploadController.deleteProfileImage);

export default router;
