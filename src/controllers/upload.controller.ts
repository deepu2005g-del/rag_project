import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';
import { processPDF } from '../services/pdf.service';
import { uploadToPinecone } from '../services/pinecone.service';

export const uploadPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No PDF file uploaded', 400);
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // 1. Read PDF, extract text, and split into chunks
    const chunks = await processPDF(filePath, originalName);

    // 2. Generate embeddings and upload vectors to Pinecone
    await uploadToPinecone(chunks);

    // 3. Delete temporary file
    fs.unlinkSync(filePath);

    // 4. Return success response
    return sendSuccess(res, {
      message: 'PDF processed and uploaded to Pinecone successfully',
      chunksProcessed: chunks.length
    });

  } catch (error) {
    // If there was an error, make sure we clean up the file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
