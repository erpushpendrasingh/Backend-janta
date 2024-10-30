const multer = require("multer");
const path = require("path");

// Set up multer storage
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
  cb(null, "uploads/"); // Define the directory to store photos
 },
 filename: (req, file, cb) => {
  cb(null, `${Date.now()}-${file.originalname}`);
 },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
 const fileTypes = /jpeg|jpg|png/;
 const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
 const mimeType = fileTypes.test(file.mimetype);
 if (mimeType && extname) {
  return cb(null, true);
 } else {
  cb(new Error("Only image files are allowed"));
 }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
