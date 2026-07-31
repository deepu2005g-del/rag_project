import { ChatGroq } from '@langchain/groq';
import { pineconeIndex } from '../config/pinecone';
import { embeddings } from '../config/embeddings';
import { PineconeStore } from '@langchain/pinecone';
import { PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { config } from '../config/env';
import { AppError } from '../utils/error.util';

// Initialize the Groq LLM
const llm = new ChatGroq({
  apiKey: config.groqApiKey,
  modelName: config.groqModel,
  temperature: 0, // Keep temperature 0 for factual RAG responses
});

// Strict prompt template preventing hallucination
const promptTemplate = `You are a helpful assistant. Use the following pieces of retrieved context to answer the question.
If the answer is unavailable in the context, respond exactly with: "I don't know based on the provided documents."
Never hallucinate or make up information.

Context:
{context}

Question: {input}

Answer:`;

const prompt = PromptTemplate.fromTemplate(promptTemplate);

export const queryRAG = async (question: string) => {
  try {
    // Setup Pinecone vector store retriever
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    // Retrieve Top K = 5
    const retriever = vectorStore.asRetriever(5);

    // Create the RAG chain
    const combineDocsChain = await createStuffDocumentsChain({
      llm: llm as any,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      retriever: retriever as any,
      combineDocsChain,
    });

    // Execute the chain
    const response = await retrievalChain.invoke({
      input: question,
    });

    const chunksData = response.context.map((doc: any) => ({
      text: doc.pageContent || doc.metadata?.chunk || doc.metadata?.text || "",
      source: doc.metadata?.source || "Unknown",
      page: doc.metadata?.page || 1
    }));

    return {
      answer: response.answer,
      chunks: chunksData
    };
  } catch (error: any) {
    throw new AppError(`Error during RAG query: ${error.message}`, 500);
  }
};
