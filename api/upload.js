import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, contentType, size } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename and contentType required" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: "File type not allowed. Use JPG, PNG, WebP, or GIF." });
    }

    const maxSize = 10 * 1024 * 1024;
    if (size && size > maxSize) {
      return res.status(400).json({ error: "File too large. Maximum 10MB." });
    }

    const ext = filename.split(".").pop() || "jpg";
    const safeName = filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 80);
    const key = `booking-refs/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    const publicBase = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
    const publicUrl = `${publicBase}/${key}`;

    return res.status(200).json({ presignedUrl, publicUrl, key });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
}
