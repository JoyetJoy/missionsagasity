"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const region = process.env.DO_SPACES_REGION || "sfo3";
const endpoint = process.env.DO_SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`;
const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;
if (!accessKeyId || !secretAccessKey) {
    console.warn("DigitalOcean Spaces credentials are not fully configured in .env");
}
exports.s3Client = new client_s3_1.S3Client({
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
    },
    forcePathStyle: false, // DigitalOcean Spaces requires this to be false for subdomain-style access
});
exports.bucketName = process.env.DO_SPACES_BUCKET || "youbuilt";
//# sourceMappingURL=s3.js.map