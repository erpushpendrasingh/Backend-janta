const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

// AWS S3 Configuration for v3 SDK
const s3 = new S3Client({
 region: process.env.AWS_REGION,
 credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
 },
});

module.exports = s3;
