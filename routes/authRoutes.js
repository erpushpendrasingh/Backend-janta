const express = require("express");
const authRoutes = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
 registerUser,
 loginUser,
 getCurrentUser,
 updateUser,
 getUsers,
} = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

// User registration route
authRoutes.get("/users", getUsers);

// Current user route (protected route)
authRoutes.get("/me", protect, getCurrentUser);
authRoutes.post("/register", registerUser);

// User login route
authRoutes.post("/login", loginUser);

// Update user details (protected route)
authRoutes.put("/update", protect, upload.single("photo"), updateUser);

module.exports = authRoutes;
