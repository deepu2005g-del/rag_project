import { Pinecone } from '@pinecone-database/pinecone';
import { config } from './env';

// Initialize Pinecone client
export const pinecone = new Pinecone({
  apiKey: config.pineconeApiKey as string,
});

export const pineconeIndex = pinecone.Index(config.pineconeIndex as string);
