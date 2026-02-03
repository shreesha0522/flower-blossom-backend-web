import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { isAuthenticated, isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

// Create a new router
const router = Router();

// Create an instance of the AdminController
const adminController = new AdminController();

// ✅ How middleware works in these routes:
//
// Request comes in
//       ↓
// isAuthenticated   ← Checks if user has valid token
//       ↓
// isAdmin           ← Checks if user role is "admin"
//       ↓
// upload.single()   ← Only on routes that need image upload
//       ↓
// Controller        ← Handles the actual logic

// ✅ 1. CREATE USER (with image upload)
// POST /api/admin/users
router.post(
  "/users",
  isAuthenticated,          // First: check if logged in
  isAdmin,                  // Second: check if admin
  upload.single("image"),   // Third: handle image upload
  adminController.createUser // Fourth: create the user
);

// ✅ 2. GET ALL USERS
// GET /api/admin/users
router.get(
  "/users",
  isAuthenticated,          // First: check if logged in
  isAdmin,                  // Second: check if admin
  adminController.getAllUsers // Third: get all users
);

// ✅ 3. GET SINGLE USER BY ID
// GET /api/admin/users/:id
router.get(
  "/users/:id",
  isAuthenticated,          // First: check if logged in
  isAdmin,                  // Second: check if admin
  adminController.getUserById // Third: get user by id
);

// ✅ 4. UPDATE USER BY ID (with image upload)
// PUT /api/admin/users/:id
router.put(
  "/users/:id",
  isAuthenticated,          // First: check if logged in
  isAdmin,                  // Second: check if admin
  upload.single("image"),   // Third: handle image upload
  adminController.updateUser // Fourth: update the user
);

// ✅ 5. DELETE USER BY ID
// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  isAuthenticated,          // First: check if logged in
  isAdmin,                  // Second: check if admin
  adminController.deleteUser // Third: delete the user
);

export default router;
