"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
/**
 * @route POST /api/upload/single
 * @desc Upload a single file (image or PDF)
 * @access Private
 */
router.post("/single", auth_1.authenticate, (req, res, next) => {
    (0, upload_1.uploadSingle)("file")(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ error: `Multer error: ${err.message}` });
        }
        else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, (req, res) => {
    try {
        const typedReq = req;
        if (!typedReq.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const file = typedReq.file; // Cast to access multer-s3 properties like location
        res.json({
            message: "File uploaded successfully",
            url: file.location, // multer-s3 adds location property
            name: file.originalname,
            key: file.key,
            size: file.size,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: error.message || "Failed to upload file" });
    }
});
/**
 * @route POST /api/upload/multiple
 * @desc Upload multiple files
 * @access Private
 */
router.post("/multiple", auth_1.authenticate, (req, res, next) => {
    (0, upload_1.uploadMultiple)("files", 5)(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ error: `Multer error: ${err.message}` });
        }
        else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, (req, res) => {
    try {
        const files = req.files;
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const uploadedFiles = files.map((file) => ({
            url: file.location,
            name: file.originalname,
            key: file.key,
            size: file.size,
        }));
        res.json({
            message: `${files.length} files uploaded successfully`,
            files: uploadedFiles,
        });
    }
    catch (error) {
        console.error("Multiple upload error:", error);
        res.status(500).json({ error: error.message || "Failed to upload files" });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map