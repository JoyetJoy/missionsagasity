import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.DO_SPACES_REGION || "sfo3";
const endpoint = process.env.DO_SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`;
const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;

if (!accessKeyId || !secretAccessKey) {
  console.warn("DigitalOcean Spaces credentials are not fully configured in .env");
}

export const s3Client = new S3Client({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  forcePathStyle: false, // DigitalOcean Spaces requires this to be false for subdomain-style access
});

export const bucketName = process.env.DO_SPACES_BUCKET || "youbuilt";
