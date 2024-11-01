// controllers/statsController.js
const BusinessModel = require("../model/BusinessModel");
const User = require("../model/UserModel");

const getCountStats = async (req, res) => {
 try {
  // Count Users with the role of 'associate_admin' and their isApproved status
  const totalApprovedAssociateAdmins = await User.countDocuments({
   role: "associate_admin",
   isApproved: true,
  });
  const totalNotApprovedAssociateAdmins = await User.countDocuments({
   role: "associate_admin",
   isApproved: false,
  });

  // Total count of associate_admin users
  const totalAssociateAdmins =
   totalApprovedAssociateAdmins + totalNotApprovedAssociateAdmins;

  // Count Businesses by accountStatus
  const pendingBusinesses = await BusinessModel.countDocuments({
   accountStatus: "Pending",
  });
  const activeBusinesses = await BusinessModel.countDocuments({
   accountStatus: "Active",
  });
  const flaggedBusinesses = await BusinessModel.countDocuments({
   accountStatus: "Flagged",
  });

  // Total count of all businesses
  const totalBusinesses =
   pendingBusinesses + activeBusinesses + flaggedBusinesses;

  // Return the counts in a JSON response
  res.json({
   associateAdmins: {
    approved: totalApprovedAssociateAdmins,
    notApproved: totalNotApprovedAssociateAdmins,
    total: totalAssociateAdmins, // Add total count
   },
   businessStatus: {
    pending: pendingBusinesses,
    active: activeBusinesses,
    flagged: flaggedBusinesses,
    total: totalBusinesses, // Add total count
   },
  });
 } catch (error) {
  console.error("Error fetching counts:", error);
  res.status(500).json({ error: "Server error" });
 }
};

module.exports = { getCountStats };
