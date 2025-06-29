import { getPineconeClient } from "@/lib/db/pinecone";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Pinecone connection...");
    
    if (!process.env.PINECONE_API_KEY) {
      return NextResponse.json({ error: "PINECONE_API_KEY not found" }, { status: 500 });
    }

    const client = getPineconeClient();
    
    // Try to list indexes to test the connection
    const indexes = await client.listIndexes();
    
    console.log("Pinecone indexes:", indexes);
    
    return NextResponse.json({ 
      success: true, 
      message: "Pinecone connection successful",
      indexes: indexes
    });
    
  } catch (error) {
    console.error("Pinecone test failed:", error);
    return NextResponse.json({ 
      error: "Pinecone connection failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 