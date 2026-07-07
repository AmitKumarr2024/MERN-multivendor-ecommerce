import Category from "../../models/category.model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../exceptions/ApiError.js";

// @desc    Create category (admin only - kept simple, no auth check shown here,
//          wire it to authorizeRoles(ROLES.ADMIN) in the route)
// @route   POST /api/categories
// @access  Private (admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, parent, image } = req.body;
    if (!name) {
      throw new BadRequestError("Category name is required");
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      throw new BadRequestError("Category with this name already exists");
    }

    const category = await Category.create({
      name,
      parent: parent || null,
      image,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories (used to populate dropdowns, filters, nav menu)
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).populate(
      "parent",
      "name slug",
    );
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin)
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const { name, parent, image, isActive } = req.body;
    if (name) category.name = name;
    if (parent !== undefined) category.parent = parent;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    await category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
