import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { fileKey, fileName } = await req.json();
    if (!fileKey || !fileName) {
      return NextResponse.json({ success: false, error: 'Missing fileKey or fileName' }, { status: 400 });
    }

    // Create a new chat record in the database
    const [newChat] = await db
      .insert(chats)
      .values({
        pdfName: fileName,
        pdfUrl: `https://your-s3-bucket.s3.amazonaws.com/${fileKey}`, // Update with your actual S3 URL
        userId: userId,
        fileKey: fileKey
      })
      .returning({ id: chats.id });

    const chatId = newChat.id;

    return NextResponse.json({ success: true, chatId });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 