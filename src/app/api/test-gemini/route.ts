import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Gemini API connection...");
    
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCikc_96Dmwhsxpc5lo_StSjMu3khbu-nk";
    
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not found" }, { status: 500 });
    }

    // Initialize the model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Test with a simple prompt
    const result = await model.generateContent("Hello! Please respond with 'Gemini API is working correctly!'");
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini API test successful:", text);
    
    return NextResponse.json({ 
      success: true, 
      message: "Gemini API connection successful",
      response: text,
      model: "gemini-1.5-pro"
    });
    
  } catch (error) {
    console.error("Gemini API test failed:", error);
    return NextResponse.json({ 
      error: "Gemini API connection failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 