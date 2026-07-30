import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import DocumentService from '../services/DocumentService.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  const { researchId, textContent, filename: bodyFilename } = req.body;
  const file = req.file;

  let filename = bodyFilename;
  let buffer = null;
  let mimeType = 'text/plain';

  if (file) {
    filename = file.originalname;
    buffer = file.buffer;
    mimeType = file.mimetype;
  } else if (!textContent) {
    return sendError(res, 400, 'Please provide either a file upload or raw text content.');
  } else if (!filename) {
    filename = `pasted_text_${Date.now()}.txt`;
  }

  const result = await DocumentService.uploadDocument({
    researchId,
    filename,
    buffer,
    textContent,
    mimeType
  });

  sendSuccess(res, 201, result, 'Document uploaded and chunked successfully');
});

export const processDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.body;
  // Documents are auto-chunked on upload in Phase 3. Return success status.
  sendSuccess(res, 200, { documentId, status: 'PROCESSED' }, 'Document text processing & chunking complete');
});

export const getDocuments = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const documents = await DocumentService.getDocumentsByResearchId(researchId);
  sendSuccess(res, 200, documents, 'Documents retrieved successfully');
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await DocumentService.deleteDocument(id);
  sendSuccess(res, 200, doc, 'Document and associated chunks deleted successfully');
});
