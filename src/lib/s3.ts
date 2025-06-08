import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  const s3 = new S3({
    region: "eu-north-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    },
  });

  const file_key = "uploads/" + Date.now().toString() + "-" + file.name.replace(/\s+/g, "-");

  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: file_key,
    Body: file as Blob, // ✅ FIX: ensures correct browser-compatible type
    ContentType: file.type, // Optional but good practice
  });

  await s3.send(command);

  return {
    file_key,
    file_name: file.name,
  };
}
