import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { messages, chats } from "@/lib/db/schema";
import { extractTextFromPDF } from "@/lib/pdf-processor";
import { createVectorStore, createQAChain } from "@/lib/openai";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, question } = await request.json();

    if (!chatId || !question) {
      return NextResponse.json(
        { error: "Chat ID and question are required" },
        { status: 400 }
      );
    }

    // Get chat details to find the file key
    const chatResult = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);

    if (chatResult.length === 0) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const chat = chatResult[0];

    // Extract text from PDF and create vector store
    const text = await extractTextFromPDF(chat.fileKey);
    const vectorStore = await createVectorStore(text);
    
    // Create QA chain
    const chain = await createQAChain(vectorStore);

    // Get answer from the chain
    const response = await chain.call({
      query: question,
    });

    // Save user message
    await db.insert(messages).values({
      chatId: chatId,
      content: question,
      role: "user",
    });

    // Save AI response
    const [aiMessage] = await db.insert(messages).values({
      chatId: chatId,
      content: response.text,
      role: "system",
    }).returning();

    return NextResponse.json({
      success: true,
      answer: response.text,
      messageId: aiMessage.id,
      sources: response.sourceDocuments || []
    });

  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 