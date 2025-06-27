import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import pdf from "pdf-parse";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

// Helper to convert stream to buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileKey, fileName } = await request.json();
    if (!fileKey || !fileName) {
      return NextResponse.json({ error: "Missing fileKey or fileName" }, { status: 400 });
    }

    // Download PDF from S3
    const s3 = new S3({
      region: "eu-north-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    });

    const response = await s3.send(command);
    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error("Invalid PDF stream from S3");
    }

    const buffer = await streamToBuffer(response.Body);
    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;

    // Store metadata in DB
    const [chat] = await db.insert(chats).values({
      pdfName: fileName,
      pdfUrl: `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${fileKey}`,
      userId: userId,
      fileKey: fileKey,
    }).returning();

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      text: extractedText,
      message: "PDF processed and saved",
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
