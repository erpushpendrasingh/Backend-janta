const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
 try {
  await mongoose.connect(
   "mongodb+srv://mozomagic2024:1234@cluster0.em4kx1o.mongodb.net/janta_web?retryWrites=true&w=majority&appName=Cluster0",
   {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   }
  );
  console.log("MongoDB connected");
 } catch (err) {
  console.error(err.message);
  process.exit(1);
 }
};

module.exports = connectDB;
