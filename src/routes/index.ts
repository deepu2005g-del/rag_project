import { Router } from 'express';
import { uploadPDF } from '../controllers/upload.controller';
import { chat } from '../controllers/chat.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// POST /upload - Upload and process PDF
router.post('/upload', upload.single('file'), uploadPDF);

// POST /chat - Chat with documents
router.post('/chat', chat);

export default router;
