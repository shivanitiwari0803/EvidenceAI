import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  processDocument,
  getDocuments,
  deleteDocument
} from '../controllers/document.controller.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/documents/upload', upload.single('file'), uploadDocument);
router.post('/documents/process', processDocument);
router.get('/documents/:researchId', getDocuments);
router.delete('/documents/:id', deleteDocument);

export default router;
