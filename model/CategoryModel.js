// models/Category.js

const mongoose = require("mongoose");

// Category Schema to support nested levels
const CategorySchema = new mongoose.Schema(
 {
  name: {
   type: String,
   //    required: true,
   unique: true,
  },
  description: {
   type: String,
  },
  parentCategory: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Category",
   default: null, // Root categories will have no parent
  },
 },
 {
  timestamps: true, // Automatically add createdAt and updatedAt fields
 }
);

// Self-referencing relationship for subcategories
CategorySchema.virtual("subcategories", {
 ref: "Category",
 localField: "_id",
 foreignField: "parentCategory",
 justOne: false,
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
