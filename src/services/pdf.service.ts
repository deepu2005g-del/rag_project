import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { AppError } from '../utils/error.util';

export const processPDF = async (filePath: string, originalName: string) => {
  try {
    // Load the PDF file
    const loader = new PDFLoader(filePath, {
      splitPages: true,
    });
    
    const docs = await loader.load();
    
    if (!docs || docs.length === 0) {
      throw new AppError('The PDF is empty or could not be read.', 400);
    }

    // Split text into chunks
    // We use chunk size 1000 to keep enough context for the LLM without exceeding token limits
    // We use chunk overlap 200 to ensure context isn't lost at the boundary of chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Add source filename to metadata
    const enrichedDocs = splitDocs.map(doc => {
      return {
        ...doc,
        metadata: {
          ...doc.metadata,
          source: originalName,
          page: doc.metadata.loc?.pageNumber || 1,
          chunk: doc.pageContent // Store the actual text chunk in metadata as requested
        }
      };
    });

    return enrichedDocs;
  } catch (error: any) {
    throw new AppError(`Error processing PDF: ${error.message}`, 500);
  }
};
