live server : https://rag-project-1byr.onrender.com # RAG Project

A production-ready Retrieval-Augmented Generation (RAG) backend with a premium web interface. Upload PDF documents, store them as vector embeddings in Pinecone, and chat with your documents using Groq LLM.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + TypeScript |
| Framework | Express.js |
| Vector Database | Pinecone |
| Embedding Model | BAAI/bge-base-en-v1.5 (HuggingFace) |
| LLM | Groq API |
| Orchestration | LangChain |
| Frontend | Vanilla HTML/CSS/JS |

## Project Structure

```
rag_project/
├── public/                     # Frontend UI
│   ├── index.html              # Main HTML page
│   ├── style.css               # Premium dark-mode styling
│   └── script.js               # Frontend logic (upload + chat)
├── src/
│   ├── config/
│   │   ├── embeddings.ts       # HuggingFace embedding model config
│   │   ├── env.ts              # Environment variable validation
│   │   └── pinecone.ts         # Pinecone client initialization
│   ├── controllers/
│   │   ├── chat.controller.ts  # POST /api/chat handler
│   │   └── upload.controller.ts# POST /api/upload handler
│   ├── middlewares/
│   │   ├── error.middleware.ts  # Global error handler
│   │   └── upload.middleware.ts # Multer PDF upload config
│   ├── routes/
│   │   └── index.ts            # Route definitions
│   ├── services/
│   │   ├── pdf.service.ts      # PDF parsing & text splitting
│   │   ├── pinecone.service.ts # Vector storage operations
│   │   └── rag.service.ts      # RAG chain (retrieval + LLM)
│   ├── utils/
│   │   ├── error.util.ts       # Custom AppError class
│   │   └── response.util.ts    # Standardized JSON responses
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Pinecone account with an index created
- A HuggingFace API key
- A Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/deepu2005g-del/rag_project.git
cd rag_project
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
HUGGINGFACEHUB_API_KEY=your_huggingface_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 4. Pinecone Index Setup

Create an index in your Pinecone dashboard with:
- **Dimensions:** 768
- **Metric:** Cosine

### 5. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

## API Endpoints

### POST `/api/upload`

Upload a PDF document to be processed and stored in Pinecone.

**Request:** `multipart/form-data` with a `file` field containing a PDF.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "PDF processed and uploaded to Pinecone successfully",
    "chunksProcessed": 42
  }
}
```

### POST `/api/chat`

Ask a question about the uploaded documents.

**Request:**
```json
{
  "question": "What is this document about?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "The document is about...",
    "chunks": [
      {
        "text": "Relevant text snippet...",
        "source": "document.pdf",
        "page": 1
      }
    ]
  }
}
```

## How It Works

1. **Upload:** A PDF is uploaded, parsed using LangChain's `PDFLoader`, and split into chunks using `RecursiveCharacterTextSplitter` (chunk size: 1000, overlap: 200).
2. **Embed:** Each chunk is embedded using the `BAAI/bge-base-en-v1.5` model via the HuggingFace Inference API.
3. **Store:** The embeddings and metadata (source, page, chunk text) are stored in Pinecone.
4. **Query:** When a user asks a question, the query is embedded, the top 5 most similar chunks are retrieved from Pinecone, and the context is sent to Groq's LLM.
5. **Answer:** The LLM generates an answer strictly from the retrieved context. If the answer isn't available, it responds with *"I don't know based on the provided documents."*

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot-reload (nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled production build |

## License

This project is for educational and personal use.
