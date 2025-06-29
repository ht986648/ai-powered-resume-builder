import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Test endpoint received:", body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test endpoint working",
      received: body 
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 