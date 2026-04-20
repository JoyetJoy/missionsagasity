import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client, bucketName } from "../lib/s3";
import { Request } from "express";
import path from "path";

// File filter to restrict types
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif) and PDFs are allowed!"));
  }
};

// Configure Multer and Multer-S3
export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    acl: "public-read", // Makes the file publicly accessible via URL
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      // Create a clean filename: timestamp + slugified original name
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext)
        .replace(/[^\w]/gi, '_') // Replace non-alphanumeric with underscore
        .toLowerCase();
      
      const folder = file.mimetype.includes("pdf") ? "pdfs" : "images";
      cb(null, `${folder}/${baseName}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Helper for multiple file uploads
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => upload.array(fieldName, maxCount);
