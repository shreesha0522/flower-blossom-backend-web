import { Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";

const productService = new ProductService();

/**
 * @class ProductController
 * @desc Handles all HTTP requests for product endpoints
 */
export class ProductController {

  /**
   * @desc    Get all products with filtering, sorting, and pagination
   * @route   GET /api/products
   * @access  Public
   */
  getAllProducts = async (req: Request, res: Response) => {
    try {
      const {
        page = "1",
        limit = "10",
        search = "",
        category = "",
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const result = await productService.getAllProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        category: category as string,
        sortBy: sortBy as string,
        order: order as string,
      });

      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          totalProducts: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        links: {
          self: `/api/products?page=${result.page}&limit=${result.limit}`,
          next: result.page < result.totalPages
            ? `/api/products?page=${result.page + 1}&limit=${result.limit}`
            : null,
          prev: result.page > 1
            ? `/api/products?page=${result.page - 1}&limit=${result.limit}`
            : null,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch products",
      });
    }
  };

  /**
   * @desc    Get a single product by ID
   * @route   GET /api/products/:id
   * @access  Public
   */
  getProductById = async (req: Request, res: Response) => {
    try {
      const id = req.params["id"] as string;
      const product = await productService.getProductById(id);
      return res.status(200).json({
        success: true,
        data: product,
        links: {
          self: `/api/products/${id}`,
          all: "/api/products",
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch product",
      });
    }
  };

  /**
   * @desc    Create a new product (admin only)
   * @route   POST /api/products
   * @access  Admin
   */
  createProduct = async (req: Request, res: Response) => {
    try {
      const parsed = CreateProductDTO.safeParse({
        ...req.body,
        pricePerRose: Number(req.body.pricePerRose),
        bouquetPrice: Number(req.body.bouquetPrice),
        originalPricePerRose: Number(req.body.originalPricePerRose),
        originalBouquetPrice: Number(req.body.originalBouquetPrice),
        discount: Number(req.body.discount || 0),
        inStock: req.body.inStock === "true" || req.body.inStock === true,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }

      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const product = await productService.createProduct({
        ...parsed.data,
        image: imageUrl || "",
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
        links: {
          self: `/api/products/${product._id}`,
          all: "/api/products",
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to create product",
      });
    }
  };

  /**
   * @desc    Update a product by ID (admin only)
   * @route   PUT /api/products/:id
   * @access  Admin
   */
  updateProduct = async (req: Request, res: Response) => {
    try {
      const id = req.params["id"] as string;
      const parsed = UpdateProductDTO.safeParse({
        ...req.body,
        pricePerRose: req.body.pricePerRose ? Number(req.body.pricePerRose) : undefined,
        bouquetPrice: req.body.bouquetPrice ? Number(req.body.bouquetPrice) : undefined,
        originalPricePerRose: req.body.originalPricePerRose ? Number(req.body.originalPricePerRose) : undefined,
        originalBouquetPrice: req.body.originalBouquetPrice ? Number(req.body.originalBouquetPrice) : undefined,
        discount: req.body.discount !== undefined ? Number(req.body.discount) : undefined,
        inStock: req.body.inStock !== undefined
          ? req.body.inStock === "true" || req.body.inStock === true
          : undefined,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
        });
      }

      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const product = await productService.updateProduct(id, {
        ...parsed.data,
        ...(imageUrl && { image: imageUrl }),
      });

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
        links: {
          self: `/api/products/${id}`,
          all: "/api/products",
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update product",
      });
    }
  };

  /**
   * @desc    Delete a product by ID (admin only)
   * @route   DELETE /api/products/:id
   * @access  Admin
   */
  deleteProduct = async (req: Request, res: Response) => {
    try {
      const id = req.params["id"] as string;
      await productService.deleteProduct(id);
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        links: {
          all: "/api/products",
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  };
}