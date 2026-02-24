import { Request, Response } from "express";
import { AdminService } from "../service/admin.service";

const adminService = new AdminService();

/**
 * @class AdminController
 * @desc Handles all admin-related operations including user management
 */
export class AdminController {

  /**
   * @desc    Create a new user as admin
   * @route   POST /api/admin/users
   * @access  Private (Admin only)
   * @param   {Request} req - Express request object containing user data in body and optional image file
   * @param   {Response} res - Express response object
   * @returns {Object} Created user data with HATEOAS links
   */
  createUser = async (req: Request, res: Response) => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      const newUser = await adminService.createUser(req.body, imagePath);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          profileImage: newUser.profileImage,
        },
        _links: {
          self: { href: `/api/admin/users/${newUser._id}`, method: "GET" },
          update: { href: `/api/admin/users/${newUser._id}`, method: "PUT" },
          delete: { href: `/api/admin/users/${newUser._id}`, method: "DELETE" },
          allUsers: { href: `/api/admin/users`, method: "GET" },
        },
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Failed to create user",
      });
    }
  };

  /**
   * @desc    Get all users with pagination, filtering and search
   * @route   GET /api/admin/users
   * @access  Private (Admin only)
   * @param   {Request} req - Express request object with optional query params: page, limit, search, role
   * @param   {Response} res - Express response object
   * @returns {Object} Paginated list of users with pagination metadata and HATEOAS links
   */
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = (req.query.search as string) || "";
      const role = (req.query.role as string) || "";

      const query: any = {};
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ];
      }
      if (role && ["user", "admin"].includes(role)) query.role = role;

      const { users, totalUsers, totalPages } = await adminService.getAllUsers(query, page, limit);

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          _links: {
            self: { href: `/api/admin/users/${user._id}`, method: "GET" },
            update: { href: `/api/admin/users/${user._id}`, method: "PUT" },
            delete: { href: `/api/admin/users/${user._id}`, method: "DELETE" },
          },
        })),
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        _links: {
          self: { href: `/api/admin/users?page=${page}&limit=${limit}`, method: "GET" },
          next: page < totalPages ? { href: `/api/admin/users?page=${page + 1}&limit=${limit}`, method: "GET" } : null,
          prev: page > 1 ? { href: `/api/admin/users?page=${page - 1}&limit=${limit}`, method: "GET" } : null,
          create: { href: `/api/admin/users`, method: "POST" },
        },
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Failed to fetch users",
      });
    }
  };

  /**
   * @desc    Get a single user by ID
   * @route   GET /api/admin/users/:id
   * @access  Private (Admin only)
   * @param   {Request} req - Express request object containing user ID in params
   * @param   {Response} res - Express response object
   * @returns {Object} Single user data with HATEOAS links
   */
  getUserById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await adminService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        _links: {
          self: { href: `/api/admin/users/${id}`, method: "GET" },
          update: { href: `/api/admin/users/${id}`, method: "PUT" },
          delete: { href: `/api/admin/users/${id}`, method: "DELETE" },
          allUsers: { href: `/api/admin/users`, method: "GET" },
        },
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Failed to fetch user",
      });
    }
  };

  /**
   * @desc    Update a user by ID
   * @route   PUT /api/admin/users/:id
   * @access  Private (Admin only)
   * @param   {Request} req - Express request object containing user ID in params and update data in body
   * @param   {Response} res - Express response object
   * @returns {Object} Updated user data with HATEOAS links
   */
  updateUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { username, email, firstName, lastName, role, bio, phone, removeImage } = req.body;

      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (role) updateData.role = role;
      if (bio !== undefined) updateData.bio = bio || null;
      if (phone !== undefined) updateData.phone = phone || null;

      const newImagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      const shouldRemoveImage = removeImage === "true";

      const updatedUser = await adminService.updateUser(id, updateData, newImagePath, shouldRemoveImage);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          id: updatedUser?._id,
          username: updatedUser?.username,
          email: updatedUser?.email,
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName,
          bio: updatedUser?.bio,
          phone: updatedUser?.phone,
          role: updatedUser?.role,
          profileImage: updatedUser?.profileImage,
          createdAt: updatedUser?.createdAt,
          updatedAt: updatedUser?.updatedAt,
        },
        _links: {
          self: { href: `/api/admin/users/${id}`, method: "GET" },
          update: { href: `/api/admin/users/${id}`, method: "PUT" },
          delete: { href: `/api/admin/users/${id}`, method: "DELETE" },
          allUsers: { href: `/api/admin/users`, method: "GET" },
        },
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  };

  /**
   * @desc    Delete a user by ID
   * @route   DELETE /api/admin/users/:id
   * @access  Private (Admin only)
   * @param   {Request} req - Express request object containing user ID in params
   * @param   {Response} res - Express response object
   * @returns {Object} Success message with HATEOAS links
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const currentUser = (req as any).user;
      const currentUserId = currentUser._id?.toString() || currentUser.id;

      await adminService.deleteUser(id, currentUserId);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        _links: {
          allUsers: { href: `/api/admin/users`, method: "GET" },
          create: { href: `/api/admin/users`, method: "POST" },
        },
      });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  };
}