import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { isAuthenticated, isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/uplaod.middleware";

const router = Router();
const productController = new ProductController();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Admin only routes
router.post("/", isAuthenticated, isAdmin, upload.single("image"), productController.createProduct);
router.put("/:id", isAuthenticated, isAdmin, upload.single("image"), productController.updateProduct);
router.delete("/:id", isAuthenticated, isAdmin, productController.deleteProduct);

export default router;