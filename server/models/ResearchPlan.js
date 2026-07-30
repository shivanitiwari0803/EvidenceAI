import mongoose from 'mongoose';

const planStepSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    objective: {
      type: String,
      default: '',
      trim: true
    },
    order: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING'
    }
  },
  { _id: false }
);

const researchPlanSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research',
      required: true
    },
    generatedBy: {
      type: String,
      default: 'OpenAI-Compatible AI Model'
    },
    steps: [planStepSchema],
    approved: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date
    },
    edited: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

export const ResearchPlan = mongoose.model('ResearchPlan', researchPlanSchema);
export default ResearchPlan;
