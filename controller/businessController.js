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

const createBusiness = async (req, res) => {
 try {
  console.log("Received body:", req.body);
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

const getAllBusinesses = async (req, res) => {
 try {
  const {
   category, // Category ID or Name (for partial matching)
   mobileNumber, // Partial or full mobile number
   area, // Partial or full area
   landmark, // Partial or full landmark
   city, // Partial or full city
   contactPerson, // Partial or full contact person name
   businessStatus, // Status of the business (Pending, Active, Flagged)
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

  // Filter by business status (Pending, Active, Flagged)
  if (businessStatus) {
   filters.accountStatus = { $regex: businessStatus, $options: "i" };
  }

  // Fetch businesses based on the filters and sort by 'createdAt' in descending order
  const businesses = await BusinessModel.find(filters)
   .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
   .populate("category", "name");

  res.status(200).json(businesses);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
 }
};

// const getAllBusinesses = async (req, res) => {
//  try {
//   const {
//    category, // Category ID or Name (for partial matching)
//    mobileNumber, // Partial or full mobile number
//    area, // Partial or full area
//    landmark, // Partial or full landmark
//    city, // Partial or full city
//    contactPerson, // Partial or full contact person name
//   } = req.query;

//   const filters = {};

//   // Filter by category (either by ID or Name)
//   if (category) {
//    const categoryObj = await Category.findOne({
//     name: { $regex: category, $options: "i" },
//    });

//    if (categoryObj) {
//     filters.category = categoryObj._id;
//    }
//   }

//   // Filter by partial mobile number
//   if (mobileNumber) {
//    filters["contactDetails.mobileNumber"] = {
//     $regex: mobileNumber,
//     $options: "i",
//    };
//   }

//   // Filter by partial area
//   if (area) {
//    filters["address.area"] = { $regex: area, $options: "i" };
//   }

//   // Filter by partial landmark
//   if (landmark) {
//    filters["address.landmark"] = { $regex: landmark, $options: "i" };
//   }

//   // Filter by partial city
//   if (city) {
//    filters["address.city"] = { $regex: city, $options: "i" };
//   }

//   // Filter by partial contact person name
//   if (contactPerson) {
//    filters["contactDetails.contactPerson"] = {
//     $regex: contactPerson,
//     $options: "i",
//    };
//   }

//   // Fetch businesses based on the filters
//   const businesses = await BusinessModel.find(filters).populate(
//    "category",
//    "name"
//   );

//   res.status(200).json(businesses);
//  } catch (err) {
//   console.error(err);
//   res.status(500).json({ message: "Server Error" });
//  }
// };

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
 const { ids } = req.body; // Expecting an array of IDs in the request body

 try {
  // Update the accountStatus of all businesses with the given IDs
  await BusinessModel.updateMany(
   { _id: { $in: ids }, accountStatus: "Pending" }, // Only update those that are currently "Pending"
   { $set: { accountStatus: "Active" } }
  );

  res.status(200).json({ message: "Businesses activated successfully" });
 } catch (error) {
  console.error("Error activating businesses:", error);
  res.status(500).json({ message: "Failed to activate businesses", error });
 }
};
const setBusinessToPendingById = async (req, res) => {
 const { ids } = req.body; // Expecting an array of IDs in the request body

 try {
  // Update the accountStatus of all businesses with the given IDs to "Pending"
  await BusinessModel.updateMany(
   { _id: { $in: ids }, accountStatus: "Active" }, // Only update those that are currently "Active"
   { $set: { accountStatus: "Pending" } }
  );

  res
   .status(200)
   .json({ message: "Businesses updated to 'Pending' status successfully" });
 } catch (error) {
  console.error("Error updating businesses to 'Pending':", error);
  res
   .status(500)
   .json({ message: "Failed to update businesses to 'Pending'", error });
 }
};
const updateBusinessDataById = async (req, res) => {
 try {
  const { id } = req.params; // Get the business ID from the request parameters

  // Find the business by ID and update its fields with the data from req.body
  const updatedBusiness = await BusinessModel.findByIdAndUpdate(
   id,
   {
    $set: {
     businessName: req.body.businessName,
     address: req.body.address,
     contactDetails: req.body.contactDetails,
     businessTimings: req.body.businessTimings,
     category: req.body.category,
     premiumListing: req.body.premiumListing === "true",
     photos: req.body.photos,
    },
   },
   { new: true } // Return the updated document
  );

  if (!updatedBusiness) {
   return res.status(404).json({ message: "Business not found" });
  }

  res.status(200).json(updatedBusiness);
 } catch (err) {
  console.error("Error updating business:", err);
  res.status(500).json({ message: "Server Error" });
 }
};

const deleteBusinessById = async (req, res) => {
 const { ids } = req.body; // Expecting an array of IDs in the request body

 try {
  // Delete the businesses with the given IDs
  await BusinessModel.deleteMany({ _id: { $in: ids } });

  res.status(200).json({ message: "Businesses deleted successfully" });
 } catch (error) {
  console.error("Error deleting businesses:", error);
  res.status(500).json({ message: "Failed to delete businesses", error });
 }
};

module.exports = {
 createBusiness,
 getAllBusinesses,
 getBusinessById,
 updateBusinessById,
 deleteBusinessById,
 updateBusinessDataById,
 setBusinessToPendingById,
 upload,
};
