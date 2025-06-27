# AI-Powered Resume Builder

An advanced web application that allows users to upload their resumes (PDFs), processes them using AI, and enables interactive chat-based Q&A about the uploaded document. Built with Next.js, Clerk authentication, PostgreSQL (Neon), AWS S3, and OpenAI.

---

## Features

- **Secure Authentication:** User sign-up/sign-in with Clerk.
- **PDF Upload:** Drag-and-drop interface for uploading resume PDFs.
- **Cloud Storage:** Files are securely stored in AWS S3.
- **AI-Powered Q&A:** Ask questions about your uploaded resume using OpenAI embeddings and vector search.
- **Chat History:** All chats and messages are stored and retrievable.
- **Modern UI:** Built with React, Next.js App Router, and Tailwind CSS.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Drizzle ORM, PostgreSQL (Neon)
- **Authentication:** Clerk
- **File Storage:** AWS S3
- **AI/ML:** OpenAI API (for embeddings and Q&A)
- **Deployment:** Vercel (recommended)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-powered-resume-builder.git
cd ai-powered-resume-builder/ai-powered-resume
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `ai-powered-resume` directory with the following content:

```env
# Database
DATABASE_URL=your_postgres_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# S3 Configuration (server-side only)
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
S3_REGION=your_s3_region

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** Never commit your `.env.local` file to version control.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Sign Up / Sign In:** Use Clerk to create an account or log in.
2. **Upload Resume:** Drag and drop your PDF resume into the upload area.
3. **Processing:** The app uploads your file to S3, processes it, and creates a chat session.
4. **Chat:** Ask questions about your resume and get instant AI-powered answers.

---

## Project Structure
ai-powered-resume/
├── src/
│ ├── app/ # Next.js app directory (pages, API routes)
│ ├── components/ # React components (FileUpload, ChatInterface, etc.)
│ ├── lib/ # Database, S3, OpenAI, and utility libraries
│ └── ... # Other source files
├── public/ # Static assets
├── package.json
├── README.md
└── ...



---

## Deployment

Deploy easily to [Vercel](https://vercel.com/) or your preferred platform. Make sure to set all environment variables in your deployment dashboard.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [Neon](https://neon.tech/)
- [AWS S3](https://aws.amazon.com/s3/)
- [OpenAI](https://openai.com/)
