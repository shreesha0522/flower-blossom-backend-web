import { ProductRepository } from "../repository/product.repository";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { HttpError } from "../error/http-error";

const productRepository = new ProductRepository();

/**
 * @class ProductService
 * @desc Service layer handling all product-related business logic
 */
export class ProductService {

  /**
   * @desc Get all products with filtering, sorting, and pagination
   */
  async getAllProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
  }) {
    return productRepository.getAllProducts(query);
  }

  /**
   * @desc Get a single product by ID
   * @throws {HttpError} 404 if product not found
   */
  async getProductById(id: string) {
    const product = await productRepository.getProductById(id);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  /**
   * @desc Create a new product
   */
  async createProduct(data: CreateProductDTO & { image?: string }) {
    return productRepository.createProduct(data);
  }

  /**
   * @desc Update a product by ID
   * @throws {HttpError} 404 if product not found
   */
  async updateProduct(id: string, data: UpdateProductDTO & { image?: string }) {
    const product = await productRepository.updateProduct(id, data);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  /**
   * @desc Delete a product by ID
   * @throws {HttpError} 404 if product not found
   */
  async deleteProduct(id: string) {
    const product = await productRepository.deleteProduct(id);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }
}