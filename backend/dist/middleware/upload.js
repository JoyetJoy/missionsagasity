"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3_1 = require("../lib/s3");
const path_1 = __importDefault(require("path"));
// File filter to restrict types
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error("Only images (jpeg, jpg, png, gif) and PDFs are allowed!"));
    }
};
// Configure Multer and Multer-S3
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_1.s3Client,
        bucket: s3_1.bucketName,
        acl: "public-read", // Makes the file publicly accessible via URL
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (_req, file, cb) => {
            // Create a clean filename: timestamp + slugified original name
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const baseName = path_1.default.basename(file.originalname, ext)
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
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Helper for multiple file uploads
const uploadMultiple = (fieldName, maxCount = 10) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
//# sourceMappingURL=upload.js.map