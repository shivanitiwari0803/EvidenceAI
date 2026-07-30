import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    evidenceId: { type: String, required: true },
    docName: { type: String, default: 'Document Source' },
    chunkNumber: { type: Number, default: 1 },
    excerpt: { type: String, default: '' }
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    citations: [citationSchema],
    latencyMs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
