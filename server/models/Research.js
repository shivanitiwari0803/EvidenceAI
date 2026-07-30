import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Research Project'
    },
    researchQuestion: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Research question must be at least 10 characters']
    },
    context: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PLAN_GENERATED', 'PLAN_APPROVED', 'COMPLETED'],
      default: 'DRAFT'
    },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchPlan'
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

export const Research = mongoose.model('Research', researchSchema);
export default Research;
