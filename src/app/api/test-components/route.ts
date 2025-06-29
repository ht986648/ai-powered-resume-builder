import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/db/pinecone";
import { getEmbaddings } from "@/lib/embeddings";
import { NextResponse } from "next/server";

export async function GET() {
  const results: any = {};

  // Test 1: Environment Variables
  results.environment = {
    PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
    OPEN_AI_API_KEY: !!process.env.OPEN_AI_API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    S3_ACCESS_KEY: !!process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    S3_SECRET_KEY: !!process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    S3_BUCKET: !!process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  };

  // Test 2: Database Connection
  try {
    await db.execute("SELECT 1");
    results.database = { success: true };
  } catch (error) {
    results.database = { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  // Test 3: Pinecone Connection
  try {
    const client = getPineconeClient();
    const indexes = await client.listIndexes();
    results.pinecone = { success: true, indexes: indexes };
  } catch (error) {
    results.pinecone = { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  // Test 4: OpenAI Embeddings
  try {
    const embeddings = await getEmbaddings("test");
    results.openai = { success: true, embeddingLength: embeddings.length };
  } catch (error) {
    results.openai = { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  return NextResponse.json(results);
} 