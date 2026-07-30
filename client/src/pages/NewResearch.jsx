import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Loader2,
  CheckCircle2,
  ListOrdered,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Sliders
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const NewResearch = () => {
  const navigate = useNavigate();
  const { createResearchProject, currentPlan, approveResearchPlan, loading } = useResearch();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [editableSteps, setEditableSteps] = useState([]);
  const [createdResearchId, setCreatedResearchId] = useState(null);

  const handleFormulateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !researchQuestion.trim()) {
      showToast('Please enter title and research question', 'error');
      return;
    }

    try {
      const resData = await createResearchProject(title, researchQuestion, contextInput);
      setCreatedResearchId(resData.research._id);
      setEditableSteps(resData.plan.steps || []);
      setStep(2);
    } catch (err) {
      // toast shown in context
    }
  };

  const handleStepTitleChange = (idx, newTitle) => {
    const updated = [...editableSteps];
    updated[idx].title = newTitle;
    setEditableSteps(updated);
  };

  const handleStepObjectiveChange = (idx, newObj) => {
    const updated = [...editableSteps];
    updated[idx].objective = newObj;
    setEditableSteps(updated);
  };

  const handleAddStep = () => {
    const nextOrder = editableSteps.length + 1;
    setEditableSteps([
      ...editableSteps,
      { order: nextOrder, title: `Step ${nextOrder}: New Objective`, objective: 'Define evaluation scope' }
    ]);
  };

  const handleRemoveStep = (idx) => {
    const updated = editableSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    setEditableSteps(updated);
  };

  const handleApprovePlan = async () => {
    if (!currentPlan?._id) return;
    try {
      await approveResearchPlan(currentPlan._id, editableSteps);
      navigate(`/documents/${createdResearchId}`);
    } catch (err) {
      // toast error handled in context
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-[#1F150C]" />
          Formulate Research Project
        </h1>
        <p className="text-lg text-[#5E5648] leading-relaxed">
          Define your core research goal. The AI engine will formulate a step-by-step execution plan for empirical document verification.
        </p>
      </div>

      {/* Step Stepper Indicator */}
      <div className="flex items-center gap-4 border-b border-[#CBC3B2] pb-6">
        <div className={`flex items-center gap-3 text-base font-bold ${step === 1 ? 'text-[#1F150C]' : 'text-[#5E5648]'}`}>
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-[#1F150C] text-[#FFFFFF]' : 'bg-[#CBC3B2] text-[#1F150C]'}`}>1</span>
          Formulate Question
        </div>
        <span className="text-[#CBC3B2]">—</span>
        <div className={`flex items-center gap-3 text-base font-bold ${step === 2 ? 'text-[#1F150C]' : 'text-[#5E5648]'}`}>
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-[#1F150C] text-[#FFFFFF]' : 'bg-[#CBC3B2] text-[#1F150C]'}`}>2</span>
          Approve AI Execution Plan
        </div>
      </div>

      {/* STEP 1: SECTIONED FORMULATION CARDS */}
      {step === 1 && (
        <form onSubmit={handleFormulateSubmit} className="space-y-8">
          {/* Section 1: Project Identity */}
          <Card className="p-8 space-y-4 bg-[#FAF8F2] border border-[#CBC3B2]">
            <div className="flex items-center gap-3 border-b border-[#CBC3B2] pb-3">
              <FileText className="w-5 h-5 text-[#1F150C]" />
              <h2 className="text-xl font-bold text-[#1F150C]">1. Project Identity & Metadata</h2>
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Enterprise RAG Latency & Accuracy Audit"
                className="w-full h-[50px] px-4 py-3 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
              />
            </div>
          </Card>

          {/* Section 2: Research Scope & Core Question */}
          <Card className="p-8 space-y-4 bg-[#FAF8F2] border border-[#CBC3B2]">
            <div className="flex items-center gap-3 border-b border-[#CBC3B2] pb-3">
              <HelpCircle className="w-5 h-5 text-[#1F150C]" />
              <h2 className="text-xl font-bold text-[#1F150C]">2. Core Research Scope & Hypothesis</h2>
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Primary Research Question</label>
              <textarea
                rows={4}
                required
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="What primary hypothesis or technical objective will be evaluated against source documents?"
                className="w-full min-h-[140px] p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C] leading-relaxed"
              />
            </div>
          </Card>

          {/* Section 3: Context & Scope Constraints */}
          <Card className="p-8 space-y-4 bg-[#FAF8F2] border border-[#CBC3B2]">
            <div className="flex items-center gap-3 border-b border-[#CBC3B2] pb-3">
              <Sliders className="w-5 h-5 text-[#1F150C]" />
              <h2 className="text-xl font-bold text-[#1F150C]">3. Additional Context & Constraints (Optional)</h2>
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Research Context & Technical Scope</label>
              <textarea
                rows={3}
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Include architectural constraints, evaluation parameters, or domain context..."
                className="w-full min-h-[120px] p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C] leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#CBC3B2]">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                icon={loading ? Loader2 : Sparkles}
                className={loading ? 'animate-spin' : ''}
              >
                {loading ? 'Generating AI Execution Plan...' : 'Generate Execution Plan'}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* STEP 2: INTERACTIVE PLAN APPROVAL */}
      {step === 2 && (
        <div className="space-y-8">
          <Card className="p-8 space-y-6 bg-[#FAF8F2] border border-[#CBC3B2]">
            <div className="flex items-center justify-between border-b border-[#CBC3B2] pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-[#1F150C]" />
                  Review & Customize AI Research Plan
                </h2>
                <p className="text-sm text-[#5E5648]">Review steps generated for "{title}". Modify or add steps before approval.</p>
              </div>

              <Button variant="secondary" size="sm" onClick={handleAddStep} icon={Plus}>
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {editableSteps.map((stepItem, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[#1F150C] text-[#FFFFFF] font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stepItem.title}
                      onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                      className="flex-1 h-[50px] px-4 bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl text-base font-bold text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
                    />
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      className="p-2 text-[#5E5648] hover:text-[#B3261E] hover:bg-[#FAF8F2] rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={stepItem.objective}
                    onChange={(e) => handleStepObjectiveChange(idx, e.target.value)}
                    placeholder="Step objective..."
                    className="w-full min-h-[90px] p-3 bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C] leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#CBC3B2]">
              <Button variant="ghost" size="md" onClick={() => setStep(1)}>
                Back to Formulation
              </Button>

              <Button variant="success" size="lg" onClick={handleApprovePlan} icon={CheckCircle2}>
                Approve Plan & Proceed to Documents
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewResearch;
