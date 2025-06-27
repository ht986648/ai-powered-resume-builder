import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize embeddings
export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "text-embedding-3-small",
});

// Initialize chat model
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Text splitter for chunking documents
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Function to create vector store from text
export async function createVectorStore(text: string) {
  const docs = await textSplitter.createDocuments([text]);
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}

// Function to create QA chain
export async function createQAChain(vectorStore: MemoryVectorStore) {
  const prompt = PromptTemplate.fromTemplate(`
    You are a helpful AI assistant. Answer the following question based on the provided context:
    
    Context: {context}
    
    Question: {question}
    
    Answer the question in a clear and concise manner. If the answer cannot be found in the context, say so.
  `);

  const chain = RetrievalQAChain.fromLLM(
    chatModel,
    vectorStore.asRetriever(),
    {
      prompt,
      returnSourceDocuments: true,
    }
  );

  return chain;
}

// Function to generate embeddings for a text
export async function generateEmbeddings(text: string) {
  const embeddings = await textSplitter.createDocuments([text]);
  const vectorStore = await MemoryVectorStore.fromDocuments(embeddings, new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    modelName: "text-embedding-3-small",
  }));
  
  return vectorStore;
} 