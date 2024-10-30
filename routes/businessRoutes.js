const express = require("express");
const {
 upload,
 createBusiness,
 getAllBusinesses,
 getBusinessById,
 updateBusinessById,
 deleteBusinessById,
} = require("../controller/businessController");
const { getAllCategories } = require("../controller/categoryController");
const businessRoutes = express.Router();

// Route: Create a new business with file upload
businessRoutes.post("/", createBusiness);
// Route to get all businesses
businessRoutes.get("/", getAllBusinesses);
businessRoutes.get("/category", getAllCategories);

// Route to get a business by ID
businessRoutes.get("/:id", getBusinessById);

// Route to update a business by ID
businessRoutes.put("/:id", updateBusinessById);
businessRoutes.delete("/:id", deleteBusinessById);
module.exports = businessRoutes;
