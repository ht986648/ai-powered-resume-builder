import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCikc_96Dmwhsxpc5lo_StSjMu3khbu-nk");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Simple context function - replace with your actual context logic
async function getContext(query: string, fileKey: string): Promise<string> {
  // For now, return a simple context. You can implement your actual context logic here
  return `This is context from file ${fileKey} for query: ${query}`;
}

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const systemPrompt = `AI assistant is a brand new, powerful, human-like artificial intelligence.
    The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
    AI is a well-behaved and well-mannered individual.
    AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
    AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
    AI assistant is a big fan of Pinecone and Vercel.
    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK
    AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
    If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
    AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
    AI assistant will not invent anything that is not drawn directly from the context.`;

    // Save user message into db
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // Prepare conversation history for Gemini
    const conversationHistory = messages
      .filter((message: Message) => message.role === "user")
      .map((message: Message) => ({
        role: "user",
        parts: [{ text: message.content }],
      }));

    // Add system prompt as the first message
    const fullConversation = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory,
    ];

    // Start chat with Gemini
    const chat = model.startChat({
      history: fullConversation.slice(0, -1), // Exclude the last message as it will be sent separately
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let aiResponse = "";

        try {
          // Send the last message and get streaming response
          const result = await chat.sendMessageStream(lastMessage.content);
          
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              aiResponse += chunkText;
              // Send the chunk as a data event
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }

          // Save AI message to database
          await db.insert(_messages).values({
            chatId,
            content: aiResponse,
            role: "system",
          });

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("Error in /api/chat-gemini-stream:", error);
    return NextResponse.json(
      { error: "internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 