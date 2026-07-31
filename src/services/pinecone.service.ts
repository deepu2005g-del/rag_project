import { pineconeIndex } from '../config/pinecone';
import { embeddings } from '../config/embeddings';
import { PineconeStore } from '@langchain/pinecone';
import { AppError } from '../utils/error.util';
import { Document } from '@langchain/core/documents';

export const uploadToPinecone = async (documents: Document[]) => {
  try {
    // Generate embeddings and store vectors in Pinecone
    // The PineconeStore automatically uses the embeddings model we configured
    await PineconeStore.fromDocuments(documents, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, // Process 5 chunks at a time to prevent rate limits
    });
  } catch (error: any) {
    throw new AppError(`Error uploading vectors to Pinecone: ${error.message}`, 500);
  }
};
