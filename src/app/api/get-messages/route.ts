import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    
    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const _messages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    // Convert to the format expected by the AI SDK
    const formattedMessages = _messages.map((msg) => ({
      id: msg.id.toString(),
      content: msg.content,
      role: msg.role,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error in /api/get-messages:", error);
    return NextResponse.json(
      { error: "internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}