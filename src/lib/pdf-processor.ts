import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import pdf from "pdf-parse";
import { Readable } from "stream";

const s3 = new S3({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

// Helper to convert a readable stream to buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function extractTextFromPDF(fileKey: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    });

    const response = await s3.send(command);
    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error("Invalid PDF stream from S3");
    }

    const buffer = await streamToBuffer(response.Body);
    const { text } = await pdf(buffer);
    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

export async function processPDFForChat(fileKey: string) {
  try {
    const text = await extractTextFromPDF(fileKey);
    
    const { createVectorStore } = await import("./openai");
    const vectorStore = await createVectorStore(text);
    
    return {
      text,
      vectorStore,
      success: true,
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      text: "",
      vectorStore: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
