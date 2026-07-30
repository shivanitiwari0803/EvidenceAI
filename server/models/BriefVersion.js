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

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    content: { type: String, required: true },
    citations: [citationSchema]
  },
  { _id: false }
);

const briefVersionSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    version: {
      type: Number,
      default: 1,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: ''
    },
    sections: [sectionSchema],
    evidenceQuality: {
      highCount: { type: Number, default: 0 },
      mediumCount: { type: Number, default: 0 },
      lowCount: { type: Number, default: 0 }
    },
    gapAnalysis: {
      missing: [{ type: String }],
      weak: [{ type: String }],
      contradictory: [{ type: String }],
      recommendations: [{ type: String }]
    },
    followUpQuestions: [{ type: String }],
    snapshot: [{ type: Object }],
    settings: {
      model: { type: String, default: 'OpenAI-Compatible Model' },
      generatedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

export const BriefVersion = mongoose.model('BriefVersion', briefVersionSchema);
export default BriefVersion;
