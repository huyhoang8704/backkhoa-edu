const Category = require("../models/Category");
const slugify = require("slugify");

// Create Category (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, parent, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true });

    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      slug,
      parent: parent || null,
      description,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent", "name slug");
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("parent");
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update category (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, parent, description } = req.body;

    const updateData = { name, description };
    if (name) updateData.slug = slugify(name, { lower: true });
    if (parent !== undefined) updateData.parent = parent;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
