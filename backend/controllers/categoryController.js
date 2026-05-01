const Category = require("../models/Category");

// GET all categories
exports.getCategories = async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD category
exports.addCategory = async (req, res) => {
  try {
    let image = "";
    if (req.file) {
      image = "https://full-stack-project-r5o9.vercel.app/uploads/" + req.file.filename;
    }
    const newCat = new Category({ ...req.body, image });
    await newCat.save();
    res.json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.image = "https://full-stack-project-r5o9.vercel.app/uploads/" + req.file.filename;
    }
    const data = await Category.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
