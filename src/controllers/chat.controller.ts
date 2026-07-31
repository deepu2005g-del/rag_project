import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';
import { queryRAG } from '../services/rag.service';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      throw new AppError('Question is required and must be a non-empty string', 400);
    }

    // Process query through RAG pipeline
    const { answer, chunks } = await queryRAG(question);

    return sendSuccess(res, { answer, chunks });
  } catch (error) {
    next(error);
  }
};
