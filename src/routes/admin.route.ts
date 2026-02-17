import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { isAuthenticated, isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

const router = Router();
const adminController = new AdminController();

router.post(
  "/users",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  adminController.createUser
);

router.get(
  "/users",
  isAuthenticated,
  isAdmin,
  adminController.getAllUsers
);

router.get(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  adminController.getUserById
);

router.put(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  adminController.updateUser
);

router.delete(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  adminController.deleteUser
);

export default router;
