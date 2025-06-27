# 🤖 AI-powered Resume Builder

A powerful, full-stack AI Resume Builder that combines modern technologies to deliver a seamless, intelligent job application experience. Upload resumes in PDF, perform semantic search across documents, and interact with your resume data via AI-powered Q&A.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Authentication:** Clerk (Google, GitHub, Email, OTP)
- **Storage:** AWS S3 (PDF upload & retrieval)
- **Database:** Drizzle ORM with PostgreSQL
- **AI/ML:** OpenAI GPT-4 via LangChain
- **Vector Search:** Pinecone for semantic document retrieval

---

## 📂 Features

### 📄 Resume Upload & Processing
- Users can upload resumes in PDF format.
- Files are securely stored in **AWS S3**.
- Upon upload, documents are processed and chunked into token segments (~1000 tokens) using **LangChain** for optimal retrieval and Q&A accuracy.

### 🧠 AI-powered Semantic Search & Q&A
- Uses **OpenAI API** with **LangChain** to generate vector embeddings.
- Embeddings are stored in **Pinecone**, enabling fast and meaningful semantic search across resumes.
- Ask natural language questions about resumes with fast, accurate responses.

### 🔐 Authentication
- Integrated **Clerk** for robust authentication.
- Supports sign-in via Google, GitHub, email/password, and OTP (mobile).

### 🗃️ Database Management
- Built with **Drizzle ORM** over **PostgreSQL**.
- Models include:
  - `User`
  - `Resume`
  - `Embedding`
- Supports relational linking for tracking user-uploaded resumes and embedding metadata.

### 📈 Performance
- Handles 50+ resume uploads and processing tasks daily.
- Designed for 99% uptime with scalable architecture.
- Optimized token chunking and batched uploads to prevent OpenAI rate limiting and Pinecone indexing lags.

---

## 🧱 Project Structure

