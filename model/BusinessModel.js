// models/Business.js

const mongoose = require("mongoose");

// Sub-schema for Address Information
const AddressSchema = new mongoose.Schema({
 pincode: {
  type: String,
  //   required: true,
 },
 blockNumber: {
  type: String,
 },
 streetName: {
  type: String,
 },
 area: {
  type: String,
 },
 landmark: {
  type: String,
 },
 city: {
  type: String,
  //   required: true,
 },
 state: {
  type: String,
  //   required: true,
 },
});

// Sub-schema for Contact Information
const ContactSchema = new mongoose.Schema({
 title: {
  type: String,
  enum: ["Mr", "Mrs", "Ms", "Dr"],
  //   required: true,
 },
 contactPerson: {
  type: String,
  //   required: true,
 },
 mobileNumber: {
  type: String,
  //   required: true,
 },
 whatsappNumber: {
  type: String,
 },
 sameAsMobile: {
  type: Boolean,
  default: false,
 },
 landlineNumber: {
  type: String,
 },
 email: {
  type: String,
  //   required: true,
 },
});

// Sub-schema for Business Timings
const BusinessTimingSchema = new mongoose.Schema({
 days: {
  type: [String], // List of days, e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  //   required: true,
 },
 openAt: {
  type: String, // Assuming 'HH:mm' format
  //   required: true,
 },
 closeAt: {
  type: String, // Assuming 'HH:mm' format
  //   required: true,
 },
});

// Main Business Schema
const BusinessSchema = new mongoose.Schema(
 {
  businessName: {
   type: String,
   //    required: true,
  },
  address: AddressSchema,
  contactDetails: ContactSchema,
  businessTimings: [BusinessTimingSchema], // Allow multiple time slots if needed
  photos: {
   type: [String], // URLs or paths to the photos
  },
  category: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Category",
   //    required: true,
  },
  premiumListing: {
   type: Boolean,
   default: false,
  },
  accountStatus: {
   type: String,
   enum: ["Pending", "Active", "Flagged"],
   default: "Pending",
  },
 },
 {
  timestamps: true, // Automatically add createdAt and updatedAt fields
 }
);

const BusinessModel = mongoose.model("BusinessModel", BusinessSchema);
module.exports = BusinessModel;
