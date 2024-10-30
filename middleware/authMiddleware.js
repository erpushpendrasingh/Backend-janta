const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");

exports.protect = async (req, res, next) => {
 let token;
 if (
  req.headers.authorization &&
  req.headers.authorization.startsWith("Bearer")
 ) {
  token = req.headers.authorization.split(" ")[1];
 }

 if (!token) {
  return res.status(401).json({ message: "Not authorized, no token" });
 }

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
   return res.status(401).json({ message: "Not authorized, user not found" });
  }
  next();
 } catch (error) {
  console.error(error);
  res.status(401).json({ message: "Not authorized, token failed" });
 }
};

exports.authorizeRoles = (...roles) => {
 return (req, res, next) => {
  if (!roles.includes(req.user.role)) {
   return res.status(403).json({ message: "You do not have permission" });
  }
  next();
 };
};
