import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
// Load environment variables
import 'dotenv/config'; 

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configure the S3 storage engine for Multer
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME || 'default-bucket-name',
//   acl: 'public-read', // Grants public read permission to the object
  contentType: multerS3.AUTO_CONTENT_TYPE,
  contentDisposition: 'inline', 
  key: (req, file, cb) => {
    // Create a unique file name
    const filename = `${Date.now().toString()}-${file.originalname}`;
    cb(null, filename);
  },
});

export const s3Upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});