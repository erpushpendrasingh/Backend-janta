const Category = require("../model/CategoryModel");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
const BusinessModel = require("../model/BusinessModel");

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

// // Controller to create a business
// const createBusiness = async (req, res) => {
//  try {
//   const { businessName, address, contactDetails, category, premiumListing } =
//    req.body;
//   const photos = req.files.map((file) => file.location);

//   // Find or create the category
//   let categoryObject = await Category.findOne({ name: category });
//   if (!categoryObject) {
//    categoryObject = new Category({ name: category });
//    await categoryObject.save();
//   }

//   // Create new business entry
//   const newBusiness = new BusinessModel({
//    businessName,
//    address: JSON.parse(address),
//    contactDetails: JSON.parse(contactDetails),
//    category: categoryObject._id, // Use the ObjectId from the found/created category
//    premiumListing: premiumListing === "true",
//    photos,
//   });

//   await newBusiness.save();
//   res.status(201).json(newBusiness);
//  } catch (err) {
//   console.error(err);
//   res.status(500).json({ message: "Server Error" });
//  }
// };
const createBusiness = async (req, res) => {
 try {
  // Log the received body and files for debugging
  console.log("Received body:", req.body);
  // console.log("Received files:", req.files);

  // // Parse JSON strings from req.body
  // const address = JSON.parse(req.body.address);
  // const contactDetails = JSON.parse(req.body.contactDetails);
  // const businessTimings = JSON.parse(req.body.businessTimings);

  // Collect photo URLs
  // const photos = req.files.map((file) => file.location);

  // Create new business entry
  const newBusiness = new BusinessModel({
   businessName: req.body.businessName,
   address: req.body.address,
   contactDetails: req.body.contactDetails,
   businessTimings: req.body.businessTimings,
   category: req.body.category,
   premiumListing: req.body.premiumListing === "true",
   photos: req.body.photos,
  });

  // Save the business to the database
  await newBusiness.save();
  res.status(201).json(newBusiness);
 } catch (err) {
  console.error("Error creating business:", err);
  res.status(500).json({ message: "Server Error" });
 }
};

// Controller to get all businesses
// const getAllBusinesses = async (req, res) => {
//  try {
//   const businesses = await BusinessModel.find().populate("category", "name");
//   res.status(200).json(businesses);
//  } catch (err) {
//   console.error(err);
//   res.status(500).json({ message: "Server Error" });
//  }
// };
const getAllBusinesses = async (req, res) => {
 try {
  const {
   category, // Category ID or Name (for partial matching)
   mobileNumber, // Partial or full mobile number
   area, // Partial or full area
   landmark, // Partial or full landmark
   city, // Partial or full city
   contactPerson, // Partial or full contact person name
  } = req.query;

  const filters = {};

  // Filter by category (either by ID or Name)
  if (category) {
   const categoryObj = await Category.findOne({
    name: { $regex: category, $options: "i" },
   });

   if (categoryObj) {
    filters.category = categoryObj._id;
   }
  }

  // Filter by partial mobile number
  if (mobileNumber) {
   filters["contactDetails.mobileNumber"] = {
    $regex: mobileNumber,
    $options: "i",
   };
  }

  // Filter by partial area
  if (area) {
   filters["address.area"] = { $regex: area, $options: "i" };
  }

  // Filter by partial landmark
  if (landmark) {
   filters["address.landmark"] = { $regex: landmark, $options: "i" };
  }

  // Filter by partial city
  if (city) {
   filters["address.city"] = { $regex: city, $options: "i" };
  }

  // Filter by partial contact person name
  if (contactPerson) {
   filters["contactDetails.contactPerson"] = {
    $regex: contactPerson,
    $options: "i",
   };
  }

  // Fetch businesses based on the filters
  const businesses = await BusinessModel.find(filters).populate(
   "category",
   "name"
  );

  res.status(200).json(businesses);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
 }
};

// Controller to get a business by ID
const getBusinessById = async (req, res) => {
 try {
  const { id } = req.params;
  const business = await BusinessModel.findById(id).populate(
   "category",
   "name"
  );
  if (!business) {
   return res.status(404).json({ message: "Business not found" });
  }
  res.status(200).json(business);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
 }
};

// Controller to update a business by ID
const updateBusinessById = async (req, res) => {
 try {
  const { id } = req.params;
  const { businessName, address, contactDetails, category, premiumListing } =
   req.body;

  // Find or create the category
  let categoryObject = await Category.findOne({ name: category });
  if (!categoryObject) {
   categoryObject = new Category({ name: category });
   await categoryObject.save();
  }

  const updatedBusiness = await BusinessModel.findByIdAndUpdate(
   id,
   {
    businessName,
    address: JSON.parse(address),
    contactDetails: JSON.parse(contactDetails),
    category: categoryObject._id, // Use the ObjectId from the found/created category
    premiumListing: premiumListing === "true",
   },
   { new: true, runValidators: true }
  );

  if (!updatedBusiness) {
   return res.status(404).json({ message: "Business not found" });
  }
  res.status(200).json(updatedBusiness);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
 }
};

const deleteBusinessById = async (req, res) => {
 try {
  const { id } = req.params;
  const deletedBusiness = await BusinessModel.findByIdAndDelete(id);

  if (!deletedBusiness) {
   return res.status(404).json({ message: "Business not found" });
  }

  res.status(200).json({ message: "Business deleted successfully" });
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
 }
};

module.exports = {
 createBusiness,
 getAllBusinesses,
 getBusinessById,
 updateBusinessById,
 deleteBusinessById,
 upload,
};
