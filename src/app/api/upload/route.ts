import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

// Check for required environment variables
if (!process.env.S3_ACCESS_KEY_ID) {
  throw new Error("S3_ACCESS_KEY_ID environment variable is required");
}

if (!process.env.S3_SECRET_ACCESS_KEY) {
  throw new Error("S3_SECRET_ACCESS_KEY environment variable is required");
}

if (!process.env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME environment variable is required");
}

const s3 = new S3({
  region: process.env.S3_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large. Please upload a file smaller than 10MB.' }, { status: 400 });
    }

    const file_key = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file_key,
        Body: buffer,
        ContentType: file.type,
      }));

      return NextResponse.json({ 
        success: true, 
        file_key, 
        file_name: file.name 
      });
    } catch (err) {
      console.error("S3 Upload Error:", err);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to upload file to S3: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in upload:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 