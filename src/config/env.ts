import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndex: process.env.PINECONE_INDEX || 'rag-index',
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  huggingFaceApiKey: process.env.HUGGINGFACEHUB_API_KEY
};

// Validate required environment variables
const requiredConfig = [
  'pineconeApiKey',
  'groqApiKey',
  'huggingFaceApiKey'
];

for (const key of requiredConfig) {
  if (!config[key as keyof typeof config]) {
    throw new Error(`Missing required environment variable for ${key}`);
  }
}
