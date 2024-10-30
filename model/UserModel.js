const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Common User Schema
const UserSchema = new mongoose.Schema(
 {
  username: {
   type: String,
   required: true,
   unique: true,
  },
  email: {
   type: String,
   required: true,
   unique: true,
  },
  password: {
   type: String,
   required: true,
  },
  role: {
   type: String,
   enum: ["admin", "associate_admin", "user", "vendor"],
   required: true,
  },
  photoUrl: {
   type: String, // Store the URL or path of the uploaded photo
  },
  name: {
   type: String,
   required: true,
  },
  mobileNumber: {
   type: String,
   required: true,
  },
  aadharNumber: {
   type: String,
   required: true,
  },
  panNumber: {
   type: String,
   required: true,
  },
  accountNumber: {
   type: String,
   required: true,
  },
  ifscCode: {
   type: String,
   required: true,
  },
  bankName: {
   type: String,
   required: true,
  },
  isApproved: {
   type: Boolean,
   default: false,
  },

  // Additional details based on user type
  vendorDetails: {
   shopName: String,
   shopAddress: String,
  },
  associateAdminDetails: {
   department: String,
   permissions: [String],
  },
  userDetails: {
   fullName: String,
   address: String,
  },
 },
 { timestamps: true }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
 if (!this.isModified("password")) return next();
 const salt = await bcrypt.genSalt(10);
 this.password = await bcrypt.hash(this.password, salt);
 next();
});

// Password verification
UserSchema.methods.comparePassword = function (password) {
 return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
