const Tag = require("../models/Tag");
const slugify = require("slugify");

// Create Tag (Admin)
const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true });

    const exists = await Tag.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Tag already exists" });

    const tag = await Tag.create({ name, slug });

    res.status(201).json({
      success: true,
      tag,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tags
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tag by ID
const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update tag (Admin)
const updateTag = async (req, res) => {
  try {
    const { name } = req.body;

    const updateData = { name };
    if (name) updateData.slug = slugify(name, { lower: true });

    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.status(200).json({
      success: true,
      tag,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete tag (Admin)
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.json({ success: true, message: "Tag deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
};
