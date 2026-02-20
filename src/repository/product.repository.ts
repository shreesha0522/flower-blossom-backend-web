import { ProductModel } from "../models/product.model";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";

/**
 * @class ProductRepository
 * @desc Handles all database operations for products
 */
export class ProductRepository {

  /**
   * @desc Get all products with optional filtering, sorting, and pagination
   */
  async getAllProducts({
    page = 1,
    limit = 10,
    search = "",
    category = "",
    sortBy = "createdAt",
    order = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
  }) {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * @desc Get a single product by ID
   */
  async getProductById(id: string) {
    return ProductModel.findById(id);
  }

  /**
   * @desc Create a new product
   */
  async createProduct(data: CreateProductDTO & { image?: string }) {
    return ProductModel.create(data);
  }

  /**
   * @desc Update a product by ID
   */
  async updateProduct(id: string, data: UpdateProductDTO & { image?: string }) {
    return ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * @desc Delete a product by ID
   */
  async deleteProduct(id: string) {
    return ProductModel.findByIdAndDelete(id);
  }
}