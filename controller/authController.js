const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

// AWS SDK v3 S3 Client Configuration
const s3Client = new S3Client({
 region: process.env.AWS_REGION,
 credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 },
});

// Multer-S3 configuration using AWS SDK v3
const upload = multer({
 storage: multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  key: (req, file, cb) => {
   cb(null, `photos/${Date.now().toString()}-${file.originalname}`);
  },
 }),
});

// Function to register a user
exports.registerUser = async (req, res) => {
 upload.single("photoUrl")(req, res, async (err) => {
  if (err) {
   return res
    .status(500)
    .json({ message: "File upload failed", error: err.message });
  }

  try {
   const {
    username,
    email,
    password,
    role,
    name,
    mobileNumber,
    aadharNumber,
    panNumber,
    accountNumber,
    ifscCode,
    vendorDetails,
    associateAdminDetails,
    userDetails,
    bankName,
   } = req.body;

   const existingUser = await User.findOne({ email });
   if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
   }

   // Get the uploaded photo URL from the Multer request
   const photoUrl = req.file ? req.file.location : null;

   // Create a new user
   const newUser = new User({
    username,
    email,
    password,
    role,
    name,
    mobileNumber,
    aadharNumber,
    panNumber,
    accountNumber,
    ifscCode,
    photoUrl,
    vendorDetails,
    associateAdminDetails,
    userDetails,
    bankName,
   });

   await newUser.save();
   res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
   console.error(error);
   res.status(500).json({ message: "Server error" });
  }
 });
};

// // Function to register a user
// exports.registerUser = async (req, res) => {
//  try {
//   const {
//    username,
//    email,
//    password,
//    role,
//    name,
//    mobileNumber,
//    aadharNumber,
//    panNumber,
//    accountNumber,
//    ifscCode,
//    photoUrl,
//    vendorDetails,
//    associateAdminDetails,
//    userDetails,
//   } = req.body;

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//    return res.status(400).json({ message: "User already exists" });
//   }

//   const newUser = new User({
//    username,
//    email,
//    password,
//    role,
//    name,
//    mobileNumber,
//    aadharNumber,
//    panNumber,
//    accountNumber,
//    ifscCode,
//    photoUrl,
//    vendorDetails,
//    associateAdminDetails,
//    userDetails,
//   });

//   await newUser.save();
//   res.status(201).json({ message: "User registered successfully" });
//  } catch (error) {
//   console.error(error);
//   res.status(500).json({ message: "Server error" });
//  }
// };

// Function to log in a user
exports.loginUser = async (req, res) => {
 try {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
   return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
   { id: user._id, role: user.role },
   process.env.JWT_SECRET,
   { expiresIn: "1d" }
  );

  res.status(200).json({ message: "Login successful", token });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Server error" });
 }
};

// Function to get current user info based on token
exports.getCurrentUser = async (req, res) => {
 try {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
   return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Server error" });
 }
};

// Function to update a user's details
exports.updateUser = async (req, res) => {
 try {
  const updatedFields = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedFields, {
   new: true,
  });

  if (!updatedUser) {
   return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(updatedUser);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Server error" });
 }
};
exports.getUsers = async (req, res) => {
 try {
  const { name, mobileNumber, startDate, endDate, isApproved, isBlocked } =
   req.query;
  const filters = {};

  if (name) {
   filters.name = { $regex: name, $options: "i" };
  }

  if (mobileNumber) {
   filters.mobileNumber = { $regex: mobileNumber, $options: "i" };
  }

  if (startDate && endDate) {
   filters.createdAt = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
   };
  }

  if (isApproved !== undefined) {
   filters.isApproved = isApproved === "true";
  }

  if (isBlocked !== undefined) {
   filters.isBlocked = isBlocked === "true";
  }

  const users = await User.find(filters);
  res.status(200).json(users);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to fetch users" });
 }
};
exports.changeApprovalStatus = async (req, res) => {
 try {
  const { userId, status } = req.body; // `status` should be `true` or `false`

  const user = await User.findByIdAndUpdate(
   userId,
   { isApproved: status },
   { new: true }
  );

  if (!user) {
   return res.status(404).json({ message: "User not found" });
  }

  res
   .status(200)
   .json({ message: "Approval status updated successfully", user });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to update approval status" });
 }
};
exports.changeBlockStatus = async (req, res) => {
 try {
  const { userId, status } = req.body; // `status` should be `true` or `false`

  const user = await User.findByIdAndUpdate(
   userId,
   { isBlocked: status },
   { new: true }
  );

  if (!user) {
   return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "Block status updated successfully", user });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to update block status" });
 }
};
