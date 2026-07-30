import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      default: 'text/plain'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    rawText: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'UPLOADED'
    },
    hash: {
      type: String,
      required: true
    },
    chunkCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Document = mongoose.model('Document', documentSchema);
export default Document;
