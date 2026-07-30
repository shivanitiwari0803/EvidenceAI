import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    chunkNumber: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    startPosition: {
      type: Number,
      default: 0
    },
    endPosition: {
      type: Number,
      default: 0
    },
    embedding: [{
      type: Number
    }]
  },
  {
    timestamps: true
  }
);

export const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
