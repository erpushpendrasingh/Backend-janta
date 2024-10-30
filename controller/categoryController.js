const Category = require("../model/CategoryModel");

// Get all categories with optional nesting for subcategories
const getAllCategories = async (req, res) => {
 try {
  // Fetch categories and populate their subcategories using the virtual field "subcategories"
  const categories = await Category.find({ parentCategory: null }) // Fetch root categories (no parent)
   .populate({
    path: "subcategories",
    populate: { path: "subcategories" }, // Nested population if needed
   })
   .exec();

  res.status(200).json(categories);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to fetch categories" });
 }
};

module.exports = {
 getAllCategories,
};
