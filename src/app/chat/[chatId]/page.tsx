import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const chatId = parseInt(params.chatId);
  
  if (isNaN(chatId)) {
    console.log("Invalid chatId:", params.chatId);
    redirect("/");
  }

  try {
    // Get chat details
    const chatResult = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);

    if (chatResult.length === 0) {
      console.log(`Chat ${chatId} not found for user ${userId}`);
      redirect("/");
    }

    const chat = chatResult[0];

    // Get messages for this chat
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat with: {chat.pdfName}
            </h1>
            <p className="text-gray-600 mt-1">
              Ask questions about your uploaded PDF document
            </p>
          </div>

          {/* Chat Interface */}
          <ChatInterface 
            chatId={chatId} 
            messages={chatMessages.map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              createdAt: msg.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading chat:", error);
    redirect("/");
  }
} 