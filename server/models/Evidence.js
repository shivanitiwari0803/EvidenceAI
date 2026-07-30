import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    planStepId: {
      type: String,
      required: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    chunkId: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true
    },
    classification: {
      type: String,
      enum: ['Supporting', 'Conflicting', 'Insufficient'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    reason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Evidence = mongoose.model('Evidence', evidenceSchema);
export default Evidence;
